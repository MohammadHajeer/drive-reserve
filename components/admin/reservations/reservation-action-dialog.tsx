"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { AdminReservation } from "@/features/admin/reservations/admin-reservation.types";
export function ReservationActionDialog({ reservation, action, open, busy, onOpenChange, onConfirm }: { reservation?: AdminReservation; action:"approve"|"reject"; open:boolean; busy:boolean; onOpenChange:(open:boolean)=>void; onConfirm:(reason?:string)=>void }) {
  const [reason,setReason]=useState("");
  const reject=action==="reject";
  return <Dialog open={open} onOpenChange={(nextOpen)=>{ if(!nextOpen) setReason(""); onOpenChange(nextOpen); }}><DialogContent><DialogHeader><DialogTitle>{reject?"Reject reservation":"Approve reservation"}</DialogTitle><DialogDescription>{reject?`Explain why ${reservation?.reference ?? "this reservation"} is being rejected.`:`Confirm that ${reservation?.reference ?? "this reservation"} should be approved.`}</DialogDescription></DialogHeader>{reject&&<div><label className="mb-2 block text-sm font-medium" htmlFor="rejection-reason">Rejection reason</label><Textarea id="rejection-reason" value={reason} onChange={(e)=>setReason(e.target.value)} placeholder="Enter a clear reason for the customer..." className="min-h-28"/></div>}<DialogFooter><Button variant="outline" disabled={busy} onClick={()=>onOpenChange(false)}>Cancel</Button><Button variant={reject?"destructive":"default"} disabled={busy || (reject && reason.trim().length<5)} onClick={()=>onConfirm(reason.trim()||undefined)}>{busy&&<Loader2 className="animate-spin"/>}{reject?"Reject reservation":"Approve reservation"}</Button></DialogFooter></DialogContent></Dialog>;
}
