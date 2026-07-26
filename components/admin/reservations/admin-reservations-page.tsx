"use client";
import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { AdminReservation, AdminReservationsQuery } from "@/features/admin/reservations/admin-reservation.types";
import { useAdminReservations } from "@/features/admin/reservations/hooks/use-admin-reservations";
import { useUpdateAdminReservationStatus } from "@/features/admin/reservations/hooks/use-update-admin-reservation-status";
import type { ReservationStatus } from "@/types/domain";
import { ReservationActionDialog } from "./reservation-action-dialog";
import { ReservationSummaryCards } from "./reservation-summary-cards";
import { ReservationsFilters, type ReservationsFilterState } from "./reservations-filters";
import { ReservationsMobileList } from "./reservations-mobile-list";
import { ReservationsPagination } from "./reservations-pagination";
import { ReservationsEmptyState, ReservationsErrorState, ReservationsLoadingSkeleton, ReservationsNoResultsState } from "./reservations-states";
import { ReservationsTable } from "./reservations-table";

const statuses: readonly ReservationStatus[]=["pending","confirmed","active","completed","cancelled","rejected"];
function isStatus(value:string|null):value is ReservationStatus{return value!==null&&statuses.includes(value as ReservationStatus)}
function parsePage(value:string|null){const n=Number(value);return Number.isInteger(n)&&n>0?n:1}

export function AdminReservationsPage(){
 const pathname=usePathname(); const searchParams=useSearchParams();
 const [selected,setSelected]=useState<AdminReservation>(); const [action,setAction]=useState<"approve"|"reject">("approve"); const [dialogOpen,setDialogOpen]=useState(false);
 const filters=useMemo<ReservationsFilterState>(()=>({search:searchParams.get("search")??"",status:isStatus(searchParams.get("status"))?searchParams.get("status") as ReservationStatus:"all",customerId:searchParams.get("customerId")??"all",carId:searchParams.get("carId")??"all",dateFrom:searchParams.get("dateFrom")??"",dateTo:searchParams.get("dateTo")??""}),[searchParams]);
 const page=parsePage(searchParams.get("page"));
 const queryInput=useMemo<AdminReservationsQuery>(()=>({search:filters.search.trim()||undefined,status:filters.status==="all"?undefined:filters.status,customerId:filters.customerId==="all"?undefined:filters.customerId,carId:filters.carId==="all"?undefined:filters.carId,dateFrom:filters.dateFrom||undefined,dateTo:filters.dateTo||undefined,page,limit:10}),[filters,page]);
 const query=useAdminReservations(queryInput); const mutation=useUpdateAdminReservationStatus();
 const reservations=query.data?.reservations??[];
 const customers=useMemo(()=>Array.from(new Map(reservations.map((r)=>[r.customer.id,{value:r.customer.id,label:r.customer.fullName}])).values()),[reservations]);
 const cars=useMemo(()=>Array.from(new Map(reservations.map((r)=>[r.car.id,{value:r.car.id,label:`${r.car.brand} ${r.car.model}`}])).values()),[reservations]);
 const hasFilters=filters.search.trim()!==""||filters.status!=="all"||filters.customerId!=="all"||filters.carId!=="all"||filters.dateFrom!==""||filters.dateTo!=="";
 function replace(next:URLSearchParams){const qs=next.toString();window.history.replaceState(null,"",qs?`${pathname}?${qs}`:pathname)}
 function change<K extends keyof ReservationsFilterState>(name:K,value:ReservationsFilterState[K]){const next=new URLSearchParams(searchParams.toString()); if(value===""||value==="all")next.delete(name);else next.set(name,String(value));next.set("page","1");replace(next)}
 function reset(){replace(new URLSearchParams())}
 function changePage(nextPage:number){const next=new URLSearchParams(searchParams.toString());next.set("page",String(nextPage));replace(next)}
 function openAction(reservation:AdminReservation,nextAction:"approve"|"reject"){setSelected(reservation);setAction(nextAction);setDialogOpen(true)}
 async function confirm(reason?:string){if(!selected)return;try{await mutation.mutateAsync({reservationId:selected.id,status:action==="approve"?"confirmed":"rejected",reason});toast.success(action==="approve"?"Reservation approved.":"Reservation rejected.");setDialogOpen(false)}catch(error){toast.error(error instanceof Error?error.message:"Unable to update reservation.")}}
 return <div className="space-y-6"><div><p className="text-sm font-semibold text-primary">Reservation operations</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Reservations</h1><p className="mt-2 max-w-2xl text-muted-foreground">Review booking requests, track active rentals, and inspect complete reservation records.</p></div>{query.data&&<ReservationSummaryCards summary={query.data.summary}/>}<ReservationsFilters value={filters} customers={customers} cars={cars} onChange={change} onReset={reset}/>{query.isPending?<ReservationsLoadingSkeleton/>:query.isError?<ReservationsErrorState message={query.error.message} onRetry={()=>query.refetch()}/>:reservations.length===0?(hasFilters?<ReservationsNoResultsState onReset={reset}/>:<ReservationsEmptyState/>):<><ReservationsTable reservations={reservations} onApprove={(r)=>openAction(r,"approve")} onReject={(r)=>openAction(r,"reject")}/><ReservationsMobileList reservations={reservations} onApprove={(r)=>openAction(r,"approve")} onReject={(r)=>openAction(r,"reject")}/>{query.data&&<ReservationsPagination pagination={query.data.pagination} onPageChange={changePage}/>}</>}<ReservationActionDialog key={`${selected?.id}-${action}-${dialogOpen}`} reservation={selected} action={action} open={dialogOpen} busy={mutation.isPending} onOpenChange={setDialogOpen} onConfirm={confirm}/></div>
}
