import { Badge } from "@/components/ui/badge";
import type { CustomerStatus } from "@/features/admin/customers/admin-customer.types";
export function CustomerStatusBadge({status}:{status:CustomerStatus}){return <Badge variant={status==="active"?"default":"secondary"} className={status==="active"?"bg-emerald-100 text-emerald-700 hover:bg-emerald-100":"bg-amber-100 text-amber-800 hover:bg-amber-100"}>{status==="active"?"Active":"Suspended"}</Badge>}
