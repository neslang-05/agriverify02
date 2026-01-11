"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Trash2, Download, History } from "lucide-react";
import Link from "next/link";
import { getVerificationHistory, deleteVerificationHistoryItem, type VerificationHistoryItem } from "@/app/actions/history";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function VerificationHistoryPage() {
  const [history, setHistory] = useState<VerificationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<VerificationHistoryItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    const response = await getVerificationHistory(50);
    if (response.success && response.data) {
      setHistory(response.data);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    const response = await deleteVerificationHistoryItem(itemToDelete);
    if (response.success) {
      setHistory(history.filter(item => item.id !== itemToDelete));
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const getStatusConfig = (item: VerificationHistoryItem) => {
    const tag = item.vision_ai_tag?.toLowerCase();
    
    if (tag === "pure" || item.status === "genuine") {
      return {
        label: "Pure Quality",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        badgeVariant: "default" as const
      };
    } else if (tag === "negative" || item.status === "fake") {
      return {
        label: "Negative Quality",
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        badgeVariant: "destructive" as const
      };
    } else {
      return {
        label: "Suspicious",
        icon: AlertTriangle,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        badgeVariant: "secondary" as const
      };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/farmer/quality">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Verification History</h1>
          <p className="text-muted-foreground">
            View all your seed quality verification records
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon={History}
          title="No verification history"
          description="Upload seed images to start building your verification history"
          action={
            <Link href="/farmer/quality">
              <Button>Start Verification</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {history.length} verification{history.length !== 1 ? 's' : ''}
            </p>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export History
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((item) => {
              const config = getStatusConfig(item);
              const Icon = config.icon;
              // Database stores confidence as 0-1, convert to percentage
              const score = Math.round((item.vision_ai_confidence || item.confidence) * 100);

              return (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedItem(item)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge variant={config.badgeVariant}>
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                      <img
                        src={item.image_url}
                        alt="Verified seed"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${config.color}`} />
                        <span className="font-medium">Score: {score}%</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToDelete(item.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    {item.seed_variety && (
                      <p className="text-sm text-muted-foreground">
                        Variety: {item.seed_variety}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>Verification Details</DialogTitle>
                <DialogDescription>
                  {formatDate(selectedItem.created_at)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                  <img
                    src={selectedItem.image_url}
                    alt="Verified seed"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge variant={getStatusConfig(selectedItem).badgeVariant}>
                      {getStatusConfig(selectedItem).label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Quality Score</p>
                    <p className="font-semibold">
                      {Math.round((selectedItem.vision_ai_confidence || selectedItem.confidence) * 100)}%
                    </p>
                  </div>
                  {selectedItem.seed_variety && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Seed Variety</p>
                      <p className="font-semibold">{selectedItem.seed_variety}</p>
                    </div>
                  )}
                  {selectedItem.vision_ai_tag && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">AI Classification</p>
                      <p className="font-semibold">{selectedItem.vision_ai_tag}</p>
                    </div>
                  )}
                </div>
                {selectedItem.recommendation && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm font-semibold mb-1 text-blue-900">Recommendation</p>
                    <p className="text-sm text-blue-800">{selectedItem.recommendation}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Verification Record?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The verification record will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
