import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navigation } from "@/components/navigation";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Plus, Minus, QrCode, Receipt, Shield, Users, Activity } from "lucide-react";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [membershipId, setMembershipId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Access Denied",
        description: "Admin access required.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const balanceUpdateMutation = useMutation({
    mutationFn: async ({ type, membershipId, amount, description }: {
      type: 'add' | 'deduct';
      membershipId: string;
      amount: string;
      description: string;
    }) => {
      const response = await apiRequest('POST', '/api/admin/balance', {
        membershipId,
        amount,
        type,
        description,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Balance updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/membership"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setMembershipId("");
      setAmount("");
      setDescription("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update balance",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-luxury-gold rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-luxury-dark">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-luxury-cream flex items-center justify-center">
        <Card className="p-6 max-w-md mx-4">
          <div className="text-center">
            <Shield className="mx-auto mb-4 text-red-500" size={48} />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">Admin privileges required.</p>
          </div>
        </Card>
      </div>
    );
  }

  const handleBalanceUpdate = (type: 'add' | 'deduct') => {
    if (!membershipId || !amount || !description) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    balanceUpdateMutation.mutate({
      type,
      membershipId,
      amount,
      description,
    });
  };

  return (
    <div className="min-h-screen bg-luxury-cream pb-20">
      {/* Header */}
      <header className="luxury-gradient text-white px-6 py-4">
        <div className="flex items-center">
          <Shield className="mr-3" size={24} />
          <h1 className="text-xl font-playfair font-semibold">{t('staffDashboard')}</h1>
        </div>
      </header>

      {/* Admin Stats */}
      <section className="px-6 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center border-luxury-mint">
            <Users className="mx-auto mb-2 text-luxury-green" size={24} />
            <p className="text-sm text-gray-600">Active Members</p>
            <p className="text-xl font-bold text-luxury-dark">247</p>
          </Card>
          
          <Card className="p-4 text-center border-luxury-mint">
            <Activity className="mx-auto mb-2 text-luxury-gold" size={24} />
            <p className="text-sm text-gray-600">Today's Transactions</p>
            <p className="text-xl font-bold text-luxury-dark">18</p>
          </Card>
          
          <Card className="p-4 text-center border-luxury-mint">
            <Receipt className="mx-auto mb-2 text-luxury-bronze" size={24} />
            <p className="text-sm text-gray-600">Revenue Today</p>
            <p className="text-xl font-bold text-luxury-dark">$12.5K</p>
          </Card>
        </div>
      </section>

      {/* Balance Management */}
      <section className="px-6 mb-6">
        <Card className="p-6 border-luxury-mint">
          <h3 className="text-lg font-semibold mb-4 text-luxury-dark">Balance Management</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="membershipId">Membership ID</Label>
              <Input
                id="membershipId"
                type="text"
                placeholder="Enter membership ID"
                value={membershipId}
                onChange={(e) => setMembershipId(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter transaction description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => handleBalanceUpdate('add')}
                disabled={balanceUpdateMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="mr-2" size={16} />
                {t('addBalance')}
              </Button>
              
              <Button
                onClick={() => handleBalanceUpdate('deduct')}
                disabled={balanceUpdateMutation.isPending}
                variant="destructive"
                className="flex-1"
              >
                <Minus className="mr-2" size={16} />
                {t('deductBalance')}
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Quick Actions */}
      <section className="px-6 mb-6">
        <Card className="p-6 border-luxury-mint">
          <h3 className="text-lg font-semibold mb-4 text-luxury-dark">Quick Actions</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto flex-col space-y-2 p-4 border-luxury-mint">
              <QrCode size={24} className="text-luxury-green" />
              <span className="text-sm">{t('scanQr')}</span>
            </Button>
            
            <Button variant="outline" className="h-auto flex-col space-y-2 p-4 border-luxury-mint">
              <Receipt size={24} className="text-luxury-green" />
              <span className="text-sm">{t('generateReceipt')}</span>
            </Button>
            
            <Button variant="outline" className="h-auto flex-col space-y-2 p-4 border-luxury-mint">
              <Users size={24} className="text-luxury-green" />
              <span className="text-sm">Member Lookup</span>
            </Button>
            
            <Button variant="outline" className="h-auto flex-col space-y-2 p-4 border-luxury-mint">
              <Activity size={24} className="text-luxury-green" />
              <span className="text-sm">Daily Report</span>
            </Button>
          </div>
        </Card>
      </section>

      {/* Navigation */}
      <Navigation />
    </div>
  );
}
