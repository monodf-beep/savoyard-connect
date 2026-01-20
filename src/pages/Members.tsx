import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HubPageLayout } from "@/components/hub/HubPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  UserPlus, 
  Download, 
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for members - in production this would come from Supabase
const mockMembers = [
  {
    id: "1",
    firstName: "Marie",
    lastName: "Dupont",
    email: "marie.dupont@email.com",
    avatarUrl: null,
    subscriptionStatus: "active",
    subscriptionType: "Adhérent",
    subscriptionEndDate: "2026-12-31",
    joinedAt: "2024-03-15",
  },
  {
    id: "2",
    firstName: "Jean",
    lastName: "Martin",
    email: "jean.martin@email.com",
    avatarUrl: null,
    subscriptionStatus: "active",
    subscriptionType: "Membre bienfaiteur",
    subscriptionEndDate: "2026-12-31",
    joinedAt: "2023-09-01",
  },
  {
    id: "3",
    firstName: "Sophie",
    lastName: "Bernard",
    email: "sophie.bernard@email.com",
    avatarUrl: null,
    subscriptionStatus: "expiring",
    subscriptionType: "Adhérent",
    subscriptionEndDate: "2026-02-15",
    joinedAt: "2025-02-15",
  },
  {
    id: "4",
    firstName: "Pierre",
    lastName: "Moreau",
    email: "pierre.moreau@email.com",
    avatarUrl: null,
    subscriptionStatus: "expired",
    subscriptionType: "Adhérent",
    subscriptionEndDate: "2025-12-31",
    joinedAt: "2024-01-10",
  },
  {
    id: "5",
    firstName: "Isabelle",
    lastName: "Petit",
    email: "isabelle.petit@email.com",
    avatarUrl: null,
    subscriptionStatus: "active",
    subscriptionType: "Membre d'honneur",
    subscriptionEndDate: "2027-12-31",
    joinedAt: "2020-06-20",
  },
];

const Members = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredMembers = mockMembers.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || member.subscriptionStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t("members.status.active")}
          </Badge>
        );
      case "expiring":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="h-3 w-3 mr-1" />
            {t("members.status.expiring")}
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="h-3 w-3 mr-1" />
            {t("members.status.expired")}
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Stats
  const activeCount = mockMembers.filter(m => m.subscriptionStatus === "active").length;
  const expiringCount = mockMembers.filter(m => m.subscriptionStatus === "expiring").length;
  const expiredCount = mockMembers.filter(m => m.subscriptionStatus === "expired").length;

  return (
    <HubPageLayout breadcrumb={t("nav.membersSubscriptions")}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("members.title")}</h1>
          <p className="text-muted-foreground">{t("members.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            {t("members.import")}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t("members.export")}
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            {t("members.addMember")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{mockMembers.length}</div>
            <p className="text-sm text-muted-foreground">{t("members.stats.total")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-sm text-muted-foreground">{t("members.stats.active")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{expiringCount}</div>
            <p className="text-sm text-muted-foreground">{t("members.stats.expiring")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{expiredCount}</div>
            <p className="text-sm text-muted-foreground">{t("members.stats.expired")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("members.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t("members.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("members.filters.all")}</SelectItem>
                <SelectItem value="active">{t("members.filters.active")}</SelectItem>
                <SelectItem value="expiring">{t("members.filters.expiring")}</SelectItem>
                <SelectItem value="expired">{t("members.filters.expired")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("members.listTitle")}</CardTitle>
          <CardDescription>
            {filteredMembers.length} {t("members.membersCount")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("members.table.name")}</TableHead>
                <TableHead>{t("members.table.type")}</TableHead>
                <TableHead>{t("members.table.status")}</TableHead>
                <TableHead>{t("members.table.endDate")}</TableHead>
                <TableHead className="text-right">{t("members.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={member.avatarUrl || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {member.firstName[0]}{member.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.firstName} {member.lastName}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{member.subscriptionType}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(member.subscriptionStatus)}</TableCell>
                  <TableCell>{formatDate(member.subscriptionEndDate)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      {t("common.edit")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {t("members.noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </HubPageLayout>
  );
};

export default Members;
