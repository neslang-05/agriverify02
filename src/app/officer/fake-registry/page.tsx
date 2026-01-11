'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatCard } from '@/components/farmer/stat-card';

interface FakeProduct {
  id: string;
  productName: string;
  brandName: string;
  certificationNumber: string;
  batchNumber: string;
  riskLevel: 'high' | 'medium' | 'low';
  reportedBy: string;
  reportedAt: string;
  reason: string;
  verificationCount: number;
  imageUrl?: string;
}

export default function FakeRegistryPage() {
  const [products, setProducts] = useState<FakeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<{
    productName: string;
    brandName: string;
    certificationNumber: string;
    batchNumber: string;
    riskLevel: 'high' | 'medium' | 'low';
    reason: string;
  }>({
    productName: '',
    brandName: '',
    certificationNumber: '',
    batchNumber: '',
    riskLevel: 'high',
    reason: '',
  });

  // Mock data - in production this would come from Supabase
  const mockProducts: FakeProduct[] = [
    {
      id: '1',
      productName: 'Premium Hybrid Paddy Seeds',
      brandName: 'AgroCorp',
      certificationNumber: 'FCO-FAKE-001',
      batchNumber: 'BATCH-2024-001',
      riskLevel: 'high',
      reportedBy: 'Officer Sharma',
      reportedAt: '2026-01-10',
      reason: 'Packaging closely mimics genuine product with fake FCO license',
      verificationCount: 145,
    },
    {
      id: '2',
      productName: 'Elite Cotton Hybrid',
      brandName: 'FarmGold',
      certificationNumber: 'FAKE-CERT-002',
      batchNumber: 'BATCH-2024-002',
      riskLevel: 'high',
      reportedBy: 'Officer Patel',
      reportedAt: '2026-01-09',
      reason: 'Counterfeit label with altered germination percentage',
      verificationCount: 98,
    },
    {
      id: '3',
      productName: 'Super Wheat Seeds',
      brandName: 'Harvest Plus',
      certificationNumber: 'CERT-ALTERED-003',
      batchNumber: 'BATCH-2024-003',
      riskLevel: 'medium',
      reportedBy: 'Officer Singh',
      reportedAt: '2026-01-08',
      reason: 'Modified expiry date on packaging',
      verificationCount: 67,
    },
    {
      id: '4',
      productName: 'Vegetable Mix Hybrid',
      brandName: 'GreenSeeds',
      certificationNumber: 'MIS-MATCH-004',
      batchNumber: 'BATCH-2024-004',
      riskLevel: 'medium',
      reportedBy: 'Officer Kumar',
      reportedAt: '2026-01-07',
      reason: 'Certificate number does not match official records',
      verificationCount: 45,
    },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAddProduct = () => {
    if (!newProduct.productName || !newProduct.brandName) return;

    const product: FakeProduct = {
      id: Date.now().toString(),
      ...newProduct,
      reportedBy: 'Current Officer',
      reportedAt: new Date().toISOString().split('T')[0],
      verificationCount: 0,
    };

    setProducts([product, ...products]);
    setIsAddingProduct(false);
    setNewProduct({
      productName: '',
      brandName: '',
      certificationNumber: '',
      batchNumber: '',
      riskLevel: 'high',
      reason: '',
    });
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.certificationNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = filterRisk === 'all' || product.riskLevel === filterRisk;

    return matchesSearch && matchesRisk;
  });

  const stats = {
    totalFake: products.length,
    highRisk: products.filter((p) => p.riskLevel === 'high').length,
    totalVerifications: products.reduce((sum, p) => sum + p.verificationCount, 0),
    averageVerifications: Math.round(products.reduce((sum, p) => sum + p.verificationCount, 0) / products.length || 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading fake product registry..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-neutral-900">Fake Product Registry</h1>
        <p className="text-neutral-500 mt-1">
          Manage and track counterfeit seed products identified through verification system.
        </p>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <StatCard
          title="Registered Fakes"
          value={stats.totalFake}
          icon={AlertTriangle}
          description="Total in registry"
        />
        <StatCard
          title="High Risk"
          value={stats.highRisk}
          icon={AlertTriangle}
          trend={stats.highRisk > 0 ? 10 : 0}
          description="Requires action"
        />
        <StatCard
          title="Total Verifications"
          value={stats.totalVerifications}
          icon={BarChart3}
          description="Detection count"
        />
        <StatCard
          title="Avg Per Product"
          value={stats.averageVerifications}
          icon={BarChart3}
          description="Detections"
        />
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="rounded-none shadow-md border-none">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search and Filter Row */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="text-xs text-neutral-600 mb-2 block">
                    Search
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      id="search"
                      placeholder="Search by product, brand, or certificate..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-none"
                    />
                  </div>
                </div>

                <div className="md:w-48">
                  <Label htmlFor="risk-filter" className="text-xs text-neutral-600 mb-2 block">
                    Risk Level
                  </Label>
                  <Select value={filterRisk} onValueChange={setFilterRisk}>
                    <SelectTrigger id="risk-filter" className="rounded-none">
                      <SelectValue placeholder="Filter by risk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                    <DialogTrigger asChild>
                      <Button className="rounded-none bg-emerald-800 hover:bg-emerald-900">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-none">
                      <DialogHeader>
                        <DialogTitle>Register Fake Product</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="product-name">Product Name</Label>
                          <Input
                            id="product-name"
                            placeholder="e.g., Premium Hybrid Paddy"
                            value={newProduct.productName}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, productName: e.target.value })
                            }
                            className="rounded-none"
                          />
                        </div>
                        <div>
                          <Label htmlFor="brand-name">Brand Name</Label>
                          <Input
                            id="brand-name"
                            placeholder="e.g., AgroCorp"
                            value={newProduct.brandName}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, brandName: e.target.value })
                            }
                            className="rounded-none"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cert-number">Fake Certificate Number</Label>
                          <Input
                            id="cert-number"
                            placeholder="e.g., FCO-FAKE-001"
                            value={newProduct.certificationNumber}
                            onChange={(e) =>
                              setNewProduct({
                                ...newProduct,
                                certificationNumber: e.target.value,
                              })
                            }
                            className="rounded-none"
                          />
                        </div>
                        <div>
                          <Label htmlFor="batch-number">Batch Number</Label>
                          <Input
                            id="batch-number"
                            placeholder="e.g., BATCH-2024-001"
                            value={newProduct.batchNumber}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, batchNumber: e.target.value })
                            }
                            className="rounded-none"
                          />
                        </div>
                        <div>
                          <Label htmlFor="risk-level">Risk Level</Label>
                          <Select
                            value={newProduct.riskLevel}
                            onValueChange={(value: any) =>
                              setNewProduct({
                                ...newProduct,
                                riskLevel: value as 'high' | 'medium' | 'low',
                              })
                            }
                          >
                            <SelectTrigger id="risk-level" className="rounded-none">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High Risk</SelectItem>
                              <SelectItem value="medium">Medium Risk</SelectItem>
                              <SelectItem value="low">Low Risk</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="reason">Reason for Registration</Label>
                          <textarea
                            id="reason"
                            placeholder="Describe why this product was flagged as counterfeit..."
                            value={newProduct.reason}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, reason: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-neutral-300 rounded-none focus:outline-none focus:border-emerald-800"
                            rows={3}
                          />
                        </div>
                        <Button
                          onClick={handleAddProduct}
                          disabled={!newProduct.productName || !newProduct.brandName}
                          className="w-full rounded-none bg-emerald-800 hover:bg-emerald-900"
                        >
                          Register Product
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Registry Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="rounded-none shadow-md border-none">
          <CardHeader className="border-b border-neutral-200 pb-4">
            <CardTitle className="text-lg font-semibold text-neutral-900">
              Registered Counterfeit Products ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                <p className="text-neutral-500">No counterfeit products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Certificate</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Reported</TableHead>
                      <TableHead className="text-right">Detections</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{product.productName}</p>
                            <p className="text-xs text-neutral-500">{product.reason}</p>
                          </div>
                        </TableCell>
                        <TableCell>{product.brandName}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {product.certificationNumber}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.riskLevel === 'high'
                                ? 'destructive'
                                : product.riskLevel === 'medium'
                                ? 'secondary'
                                : 'default'
                            }
                            className="rounded-none"
                          >
                            {product.riskLevel.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-neutral-600">
                            <Calendar className="h-3 w-3" />
                            {product.reportedAt}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-emerald-800">
                            {product.verificationCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveProduct(product.id)}
                            className="rounded-none h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-amber-50 border border-amber-200 rounded-none p-4"
      >
        <p className="text-sm text-amber-900 font-medium mb-2">📋 Registry Information</p>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>
            • Registry is updated automatically when verification system detects suspicious patterns
          </li>
          <li>• High-risk products trigger alerts during farmer verification</li>
          <li>• Detection count increases with each farmer verification attempt</li>
          <li>• Officers can add additional products based on field reports</li>
        </ul>
      </motion.div>
    </div>
  );
}
