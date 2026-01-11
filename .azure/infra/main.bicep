param environmentName string
param location string = 'eastus2'

var resourceToken = uniqueString(subscription().id, resourceGroup().id, location, environmentName)
var acrName = 'acr${resourceToken}'
var kvName = 'kv${resourceToken}'
var laName = 'la${resourceToken}'
var caiName = 'cai${resourceToken}'
var cogsCvName = 'cogscv${resourceToken}'
var cogsCvpName = 'cogscvp${resourceToken}'
var uamiName = 'uami${resourceToken}'

resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'rg-${environmentName}'
  location: location
  tags: {
    'azd-env-name': environmentName
  }
}

resource uami 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: uamiName
  location: location
}

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

resource acrPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup.id, uami.id, '7f951dda-4ed3-4680-a7ca-43fe172d538d')
  scope: acr.id
  properties: {
    principalId: uami.properties.principalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
  }
}

resource kv 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: kvName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    accessPolicies: []
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enabledForDiskEncryption: true
    enableRbacAuthorization: true
    publicNetworkAccess: 'Enabled'
  }
}

resource kvSecretsOfficer 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup.id, uami.id, 'b86a8fe4-44ce-4948-aee5-eccb2c155cd7')
  scope: kv.id
  properties: {
    principalId: uami.properties.principalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b86a8fe4-44ce-4948-aee5-eccb2c155cd7')
  }
}

resource la 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: laName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource cai 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: caiName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: la.properties.customerId
        sharedKey: la.listKeys().primarySharedKey
      }
    }
  }
}

resource cogsCv 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: cogsCvName
  location: location
  sku: {
    name: 'S0'
  }
  kind: 'ComputerVision'
  properties: {
    customSubDomainName: cogsCvName
    networkAcls: {
      defaultAction: 'Allow'
    }
  }
}

resource cogsCvp 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: cogsCvpName
  location: location
  sku: {
    name: 'S0'
  }
  kind: 'CustomVision.Prediction'
  properties: {
    customSubDomainName: cogsCvpName
    networkAcls: {
      defaultAction: 'Allow'
    }
  }
}

resource ca 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'ca-${environmentName}'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${uami.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: cai.id
    configuration: {
      secrets: [
        {
          name: 'azure-computer-vision-endpoint'
          value: 'https://${cogsCv.properties.endpoint}'
        }
        {
          name: 'azure-computer-vision-key'
          value: cogsCv.listKeys().key1
        }
        {
          name: 'azure-custom-vision-endpoint'
          value: 'https://${cogsCvp.properties.endpoint}'
        }
        {
          name: 'azure-custom-vision-prediction-key'
          value: cogsCvp.listKeys().key1
        }
      ]
      registries: [
        {
          server: '${acr.properties.loginServer}'
          identity: uami.id
        }
      ]
      ingress: {
        external: true
        targetPort: 3000
        corsPolicy: {
          allowedOrigins: ['*']
        }
      }
    }
    template: {
      containers: [
        {
          name: 'fake-seed-detection'
          image: '${acr.properties.loginServer}/fake-seed-detection:latest'
          resources: {
            cpu: '0.5'
            memory: '1Gi'
          }
          env: [
            {
              name: 'AZURE_COMPUTER_VISION_ENDPOINT'
              secretRef: 'azure-computer-vision-endpoint'
            }
            {
              name: 'AZURE_COMPUTER_VISION_KEY'
              secretRef: 'azure-computer-vision-key'
            }
            {
              name: 'AZURE_CUSTOM_VISION_ENDPOINT'
              secretRef: 'azure-custom-vision-endpoint'
            }
            {
              name: 'AZURE_CUSTOM_VISION_PREDICTION_KEY'
              secretRef: 'azure-custom-vision-prediction-key'
            }
            {
              name: 'ENABLE_AZURE_VISION'
              value: 'true'
            }
            {
              name: 'VISION_GENUINE_THRESHOLD'
              value: '0.8'
            }
            {
              name: 'VISION_SUSPICIOUS_THRESHOLD'
              value: '0.5'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 10
      }
    }
  }
  tags: {
    'azd-service-name': 'fake-seed-detection'
  }
}

output RESOURCE_GROUP_ID string = resourceGroup.id
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = acr.properties.loginServer