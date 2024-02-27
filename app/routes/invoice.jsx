import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export default function Invoice() {
  return (
    <div className="m-auto max-w-screen-lg border-2 border-black">
      <div className="grid p-1 sm: grid-cols-12 gap-2 w-full">
        <div className="min-h-[50px] flex flex-col sm: col-span-3">
          <span className="text-base font-medium">CHENNAI SILKS</span>
          <span className="text-xs py-1">PAN:</span>
          <span className="text-xs py-1">GST:</span>
          <span className="text-xs py-1">TAN:</span>
        </div>
        <div className="min-h-[50px] flex flex-col-reverse items-center  sm: col-span-6">
          <span className="text-xl font-semibold">DRAFT TAX INVOICE</span>
        </div>
        <div className="min-h-[50px] flex  sm: col-span-3"></div>
      </div>
      <div className="h-[2px] bg-black w-full rounded-lg px-2"></div>
      {/* Info Section -1  */}
      <div className="mt-2 grid p-1 sm: grid-cols-12 gap-2 w-full">
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium">Customer Name</span>
          <span className="text-xs">Solaura Power PVT LTD</span>
        </div>
        <div className="min-h-[50px] flex   sm: col-span-4"></div>
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium">Invoice Date:</span>
          <span className="text-sm font-medium">Invoice Number:</span>
        </div>
      </div>
      {/* Info Section-2 */}
      <div className="mt-2 grid p-1 sm: grid-cols-12 gap-2 w-full">
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium">Billing Address</span>
          <span className="text-xs">
            Plot No 104, 2nd Cross Street, VGP Sea View Part - 1, Palavakkam,
            Chennai - 600 041
          </span>
        </div>
        <div className="min-h-[50px] flex   sm: col-span-4"></div>
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium">Beneficiary Address</span>
          <span className="text-xs">
            636, VIVAAGA BUILDING, OPPANAKARA STREET, COIMBATORE, Coimbatore,
            Tamil Nadu, 641001
          </span>
        </div>
      </div>
      {/* Info Section-3 */}
      <div className="mt-2 grid p-1 sm: grid-cols-12 gap-2 w-full">
        <div className="min-h-[50px] flex  sm: col-span-4">
          <span className="text-sm font-medium">GSTIN:</span>
        </div>
        <div className="min-h-[50px] flex   sm: col-span-4"></div>
        <div className="min-h-[50px] flex  sm: col-span-4">
          <span className="text-sm font-medium">GST:</span>
        </div>
      </div>
      {/* Info section-4 */}
      <div className="mt-2 grid p-1 sm: grid-cols-12 gap-2 w-full">
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium">Project Name</span>
          <span className="text-xs">Solaura Power PVT LTD</span>
        </div>
        <div className="min-h-[50px] flex flex-col  sm: col-span-4">
          <span className="text-sm font-medium">Volume Period</span>
          <span className="text-xs">01-03-2023 to 02-05-2023</span>
        </div>
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium">State:</span>
          <span className="text-sm font-medium">State Code:</span>
        </div>
      </div>
      {/* Info section-5 */}
      <div className="mt-2 grid p-1 sm: grid-cols-12 gap-2 w-full">
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium">Place of Supply: </span>
          <span className="text-sm font-medium">Name of State: </span>
        </div>
        <div className="min-h-[50px] flex   sm: col-span-4"></div>
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium">
            Electronic Reference Number:{" "}
          </span>
          <span className="text-sm font-medium">Date: </span>
        </div>
      </div>

      <div className="p-2">
        <Table className=" mt-2 border border-black">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] text-sm font-medium text-black">
                Description of Services
              </TableHead>
              <TableHead className="text-sm font-medium text-black">HSN Code</TableHead>
              <TableHead className="text-sm font-medium text-black">Taxable Value</TableHead>
              <TableHead className="text-right text-sm font-medium text-black">
                <span className="flex justify-center w-full border-b border-black">CGST</span>
                <span className="flex justify-between  w-full">
                  <p className="">Rate</p>
                  <p>Amt.</p>
                </span>
              </TableHead>
              <TableHead className="text-right text-sm font-medium text-black">
                <span className="flex justify-center w-full border-b border-black">SGST</span>
                <span className="flex justify-between  w-full">
                  <p>Rate </p>
                  <p>Amt.</p>
                </span>
              </TableHead>
              <TableHead className="text-right text-sm font-medium text-black">
                <span className="flex justify-center w-full border-b border-black">IGST</span>
                <span className="flex justify-between  w-full">
                  <p>Rate</p>
                  <p>Amt.</p>
                </span>
              </TableHead>
              <TableHead className="text-right text-sm font-medium text-black">
                <span className="flex justify-center w-full border-b border-black">CESS</span>
                <span className="flex justify-between  w-full">
                  <p>Rate</p>
                  <p>Amt.</p>
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-xs">INV001</TableCell>
              <TableCell className="text-xs">Paid</TableCell>
              <TableCell className="text-xs">Credit Card</TableCell>
              <TableCell className="text-xs">
                <span className="p-1 flex flex-row justify-between">
                  <p>78</p>
                  <p>989</p>
                </span>
              </TableCell>
              <TableCell className="text-xs">
                <span className="p-1 flex flex-row justify-between">
                  <p>78</p>
                  <p>989</p>
                </span>
              </TableCell>
              <TableCell className="text-xs">
                <span className="p-1 flex flex-row justify-between">
                  <p>78</p>
                  <p>989</p>
                </span>
              </TableCell>
              <TableCell className="text-xs">
                <span className="p-1 flex flex-row justify-between">
                  <p>78</p>
                  <p>989</p>
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="mt-2 grid p-1 sm: grid-cols-12 gap-2 w-full">
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium py-1">
            Total Invoice Value (In Figure):
          </span>
          <span className="text-sm font-medium py-1">
            Total Invoice Value (In Words):
          </span>
          <span className="text-sm font-medium py-1">
            Amount of Tax Subject to Reverse Charge:
          </span>
        </div>
        {/* <div className="min-h-[50px] flex   sm: col-span-4"></div> */}
        <div className="min-h-[50px] flex flex-row items-end justify-evenly sm: col-span-8">
          <span className="text-sm font-normal">CGST: </span>
          <span className="text-sm font-normal">SGST: </span>
          <span className="text-sm font-normal">IGST: </span>
        </div>
      </div>
      <div className="mt-2 grid p-1 sm: grid-cols-12 gap-2 w-full">
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium">
            Bank details for payment through RTGS/NEFT
          </span>
          <span className="text-xs py-1">Beneficiary Name: </span>
          <span className="text-xs py-1">Account: </span>
          <span className="text-xs py-1">IFSC: </span>
          <span className="text-xs py-1">Branch: </span>
        </div>
        <div className="min-h-[50px] flex   sm: col-span-4"></div>
        <div className="min-h-[50px] flex flex-col justify-between sm: col-span-4">
          <span className="text-sm font-medium">Name of the Signatory: </span>
          <span className="text-sm font-medium">Signature </span>
        </div>
      </div>
      <div className="mt-2 grid p-1 sm: grid-cols-12 gap-2 w-full">
        <div className="min-h-[50px] flex flex-col sm: col-span-12">
          <span className="text-sm font-medium">Payment terms and conditions:</span>
          <span className="text-xs px-4">
          <ul className="list-disc">
            <li> Immediate by cheque or wire transfer.</li>
            <li>
              The due date for payment of invoices shall be the date of issue of
              the invoice ('the due date').
            </li>
            <li>
              For payment by cheques, please issue crossed cheque in favour of
              Solaura Power Private Limited.
            </li>
            <li>
              Kindly refer the invoice number behind the cheque in case of
              cheque payment.
            </li>
            <li>
              If the payment is through NEFT/online transfer, please refer the
              invoice number in payment description.
            </li>
          </ul>
          </span>

        </div>
        {/* <div className="min-h-[50px] flex   sm: col-span-4"></div> */}
        {/* <div className="min-h-[50px] flex  sm: col-span-4"></div> */}
      </div>
      <div className="p-1 w-full"></div>
    </div>
  );
}

// export default invoicesm:
