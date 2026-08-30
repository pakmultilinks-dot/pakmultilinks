import { db, isDatabaseConfigured } from "@/lib/db";
import { DemoNotice, PageHeading } from "../../_components/ui";
import { OrdersTable, type AdminOrderRow } from "../../_components/workflow-tables";

export default async function OrdersPage() {
  let connected=isDatabaseConfigured; let rows:AdminOrderRow[]=[];
  if(connected)try{const records=await db.order.findMany({take:100,orderBy:{createdAt:"desc"},include:{items:true}});rows=records.map((order)=>({id:order.id,orderNumber:order.orderNumber,customerName:order.customerName,customerEmail:order.customerEmail,customerPhone:order.customerPhone,companyName:order.companyName||"",address:order.address,city:order.city,paymentMethod:order.paymentMethod,paymentStatus:order.paymentStatus,total:order.requiresQuote?"Quote required":Number(order.total),status:order.status,createdAt:order.createdAt.toISOString(),items:order.items.map((item)=>({name:item.productName,sku:item.sku,quantity:item.quantity}))}));}catch{connected=false;}
  return <><PageHeading eyebrow="Fulfilment" title="Orders" description="Review customer details and items, then move each verified order through fulfilment." />{!connected&&<DemoNotice localRecords/>}<OrdersTable initialRows={rows} connected={connected}/></>;
}
