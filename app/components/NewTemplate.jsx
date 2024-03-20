// MainComponent
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/table";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";

export default function MainComponent({ templates, setDocuments }) {
 

  const handleSelectClick = (docNames) => {
    setDocuments(docNames);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          select templates
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-md">
        <div className="h-80 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>choose template</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.template_name}>
                  <TableCell>{template.template_name}</TableCell>
                  <TableCell>
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                      onClick={() => handleSelectClick(template.doc_names)}
                    >
                      Select
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </PopoverContent>
    </Popover>
  );
}
