import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SearchBar, MenuItem } from "../../../components/SearchBar";
import { useSearchStore } from "../../../stores";
import {
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Person2 as BidderIcon,
} from "@mui/icons-material";

interface UserSearchBarProps {
  
  searchKeyword: string;
  filterRole: string;
  onSearchChange: (keyword: string) => void;
  onRoleFilterChange: (role: string) => void;
}

export const UserSearchBar: React.FC<UserSearchBarProps> = ({
  searchKeyword,
  filterRole,
  onSearchChange,
  onRoleFilterChange,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { searchQuery, setSearchQuery, filters, updateFilters } =
    useSearchStore();

  useEffect(() => {
    setSearchQuery(searchKeyword || "");
    updateFilters({ category: filterRole || undefined });
    
  }, [searchKeyword, filterRole]);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const role = searchParams.get("role") || "";

    if (q !== searchKeyword) onSearchChange(q);
    if (role !== filterRole) onRoleFilterChange(role);
    
  }, []);

  const menuItems: MenuItem[] = [
    { text: "Admin", icon: <AdminIcon />, path: "/admin/users" },
    { text: "Bidder", icon: <BidderIcon />, path: "/admin/users" },
    { text: "User", icon: <PersonIcon />, path: "/admin/users" },
  ];

  const navigateWith = (q: string, role: string) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (role) params.set("role", role);
    navigate(`/admin/users?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchQuery);
    navigateWith(searchQuery, filterRole);
  };

  const handleFilterSelect = (newFilters: {
    category?: string;
    sort?: string;
    endTime?: boolean;
  }) => {
    
    const role = newFilters.category || "";

    updateFilters({ category: role || undefined });
    onRoleFilterChange(role);
    navigateWith(searchQuery, role);
  };

  useEffect(() => {
    
    if (!filters.category && searchKeyword === "" && filterRole === "") return;
  }, [filters.category, filterRole, searchKeyword]);

  return (
    <SearchBar
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit}
      menuItems={menuItems}
      onFilterSelect={handleFilterSelect}
      placeholder="Search users by email..."
      maxWidth={{ xs: "100%", md: "800px" }}
    />
  );
};

export default UserSearchBar;
