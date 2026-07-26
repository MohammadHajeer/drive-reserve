"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  Download, 
  Plus, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  ArrowUpDown,
  Check
} from "lucide-react";

// Sample Reservation Data
const initialReservations = [
  {
    id: "RES-4821",
    carName: "Mercedes-Benz C-Class",
    category: "Premium Selection",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=300",
    pickupDate: "Oct 24, 2026",
    returnDate: "Oct 28, 2026",
    duration: "4 Days",
    totalPrice: "$480.00",
    status: "Active",
  },
  {
    id: "RES-4815",
    carName: "BMW X5 Luxury",
    category: "Premium Selection",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=300",
    pickupDate: "Nov 02, 2026",
    returnDate: "Nov 07, 2026",
    duration: "5 Days",
    totalPrice: "$810.00",
    status: "Confirmed",
  },
  {
    id: "RES-4792",
    carName: "Toyota Corolla",
    category: "Sedan",
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=300",
    pickupDate: "Oct 12, 2026",
    returnDate: "Oct 13, 2026",
    duration: "1 Day",
    totalPrice: "$50.00",
    status: "Pending",
  },
  {
    id: "RES-4750",
    carName: "Mercedes-Benz C-Class",
    category: "Premium Selection",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=300",
    pickupDate: "Sep 15, 2026",
    returnDate: "Sep 18, 2026",
    duration: "3 Days",
    totalPrice: "$360.00",
    status: "Completed",
  },
  {
    id: "RES-4712",
    carName: "BMW X5 Luxury",
    category: "Premium Selection",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=300",
    pickupDate: "Aug 20, 2026",
    returnDate: "Aug 22, 2026",
    duration: "2 Days",
    totalPrice: "$324.00",
    status: "Cancelled",
  },
];

const statusOptions = [
  { label: "All Statuses", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Pending", value: "PENDING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
];

export default function ReservationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOption, setSortOption] = useState("newest");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Dropdown open states
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Refs for click outside
  const statusRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusStyles: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
    Confirmed: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800",
    Pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
    Completed: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800",
  };

  // Filter reservations
  const filteredReservations = initialReservations.filter((res) => {
    const matchesSearch =
      res.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.carName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || res.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReservations = filteredReservations.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleExportCSV = () => {
    const headers = ["Reservation ID", "Vehicle", "Category", "Pickup Date", "Return Date", "Duration", "Total Price", "Status"];
    const rows = filteredReservations.map((r) => [
      r.id,
      `"${r.carName}"`,
      `"${r.category}"`,
      r.pickupDate,
      r.returnDate,
      r.duration,
      r.totalPrice,
      r.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "drivereserve-reservations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background pb-16 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back to Home Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              My Reservations
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your current bookings and view your complete rental history with DriveReserve.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-muted cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Export History
            </button>
            
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Book a New Car
            </Link>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ID or vehicle name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Custom Floating Dropdowns Matching Image 1 */}
          <div className="flex items-center gap-2 font-sans">
            
            {/* Custom Status Dropdown */}
            <div className="relative" ref={statusRef}>
              <button
                type="button"
                onClick={() => {
                  setIsStatusOpen(!isStatusOpen);
                  setIsSortOpen(false);
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100 cursor-pointer"
              >
                <Filter className="h-3.5 w-3.5 text-slate-500" />
                <span>
                  {statusOptions.find((opt) => opt.value === statusFilter)?.label}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${isStatusOpen ? "rotate-180" : ""}`} />
              </button>

              {isStatusOpen && (
                <div className="absolute right-0 z-50 mt-1.5 w-48 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-200/50 animate-in fade-in-80 zoom-in-95">
                  {statusOptions.map((option) => {
                    const isSelected = statusFilter === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setStatusFilter(option.value);
                          setIsStatusOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-blue-100/70 font-semibold text-slate-900"
                            : "font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span>{option.label}</span>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-blue-600 stroke-[2.5]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Custom Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => {
                  setIsSortOpen(!isSortOpen);
                  setIsStatusOpen(false);
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100 cursor-pointer"
              >
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
                <span>
                  {sortOptions.find((opt) => opt.value === sortOption)?.label}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 z-50 mt-1.5 w-48 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-200/50 animate-in fade-in-80 zoom-in-95">
                  {sortOptions.map((option) => {
                    const isSelected = sortOption === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSortOption(option.value);
                          setIsSortOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-blue-100/70 font-semibold text-slate-900"
                            : "font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span>{option.label}</span>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-blue-600 stroke-[2.5]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Reservation ID</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Vehicle</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Rental Dates</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Duration</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Total Price</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                  <th scope="col" className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {currentReservations.length > 0 ? (
                  currentReservations.map((res) => (
                    <tr key={res.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-6 py-4 font-semibold text-blue-600">
                        {res.id}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={res.image}
                            alt={res.carName}
                            className="h-10 w-14 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-semibold text-foreground">{res.carName}</div>
                            <div className="text-xs text-muted-foreground">{res.category}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{res.pickupDate}</span>
                        </div>
                        <div className="ml-5 text-muted-foreground">to {res.returnDate}</div>
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {res.duration}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold text-foreground">
                        {res.totalPrice}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[res.status]}`}>
                          {res.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/reservations/${res.id}`}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      No reservations found matching your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Fully Working Pagination Controls */}
          <div className="flex items-center justify-end border-t border-border px-6 py-4">
            <div className="flex items-center gap-1">
              <button 
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "border border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted disabled:opacity-50 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Need extra time?</h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                You can request a rental extension directly from the active reservation detail page.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Insurance & Safety</h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Every DriveReserve rental includes basic insurance coverage. View your policy in documents.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
            <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Cancellation Policy</h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Free cancellation is available up to 24 hours before your scheduled pickup time.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}