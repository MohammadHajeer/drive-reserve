import { AdminCustomerDetailsPage } from "@/components/admin/customers/admin-customer-details-page";
export default async function CustomerDetailsPage({params}:{params:Promise<{customerId:string}>}){const {customerId}=await params;return <AdminCustomerDetailsPage customerId={customerId}/>}
