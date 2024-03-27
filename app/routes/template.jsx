import { useEffect, useRef } from 'react';
import { Form, useActionData, useNavigation, Link,useLoaderData } from '@remix-run/react';
import db from '../utils/cdb.server';
import { toast } from 'sonner';
import { useStore } from '../utils/zustand';
import * as XLSX from 'xlsx';
import MainComponent from '../components/NewTemplate';

function ExcelUploader({ setDocuments }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const documentNames = jsonData.slice(1).map((row) => row[1]);
      setDocuments(documentNames);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="mb-4">
      <label htmlFor="excelFile" className="block mb-2 font-bold text-gray-700">
        Upload Excel File
      </label>
      <input
        type="file"
        id="excelFile"
        accept=".xlsx"
        onChange={handleFileUpload}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
    </div>
  );
}

export default function DocumentForm() {
  const { documents, documentName, setDocuments, setDocumentName } = useStore();
  const templates = useLoaderData();
  const actionData = useActionData();
  const transition = useNavigation();
  const formRef = useRef(null);

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        toast.success('Template created successfully');
      } else {
        toast.error('Unable to create template');
      }
    }
  }, [actionData]);

  useEffect(() => {
    if (transition.state === 'submitting') {
      formRef.current.reset();
      setDocuments([]);
      setDocumentName('');
    }
  }, [transition.state]);

  const handleAddDocument = () => {
    if (documentName.trim() !== '') {
      setDocuments([...documents, documentName]);
      setDocumentName('');
    }
  };

  const handleRemoveDocument = (index) => {
    const updatedDocuments = [...documents];
    updatedDocuments.splice(index, 1);
    setDocuments(updatedDocuments);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-violet-500 to-violet-800 flex items-center justify-center">
      <div className="self-start absolute top-0 left-0 p-4">
        <Link to="/clients" className="text-white hover:text-gray-300 font-bold outline outline-black outline-1 rounded px-2 py-1">
          ← Back
        </Link>
      </div>
      <Form method="post" className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg h-[600px] overflow-y-auto" ref={formRef}>
        <h2 className="text-2xl font-bold text-gray-700 mb-6">Create Template</h2>
        <div className="mb-4">
          <label htmlFor="templateName" className="block mb-2 font-bold text-gray-700">
            Template Name
          </label>
          <input
            type="text"
            id="templateName"
            name="templateName"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="documentName" className="block mb-2 font-bold text-gray-700">
            Document Name
          </label>
          <div className="flex">
            <input
              type="text"
              id="documentName"
              name="documentName"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="button"
              onClick={handleAddDocument}
              className="px-4 py-2 bg-violet-500 text-white rounded-r-md hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              Add
            </button>
          </div>
        </div>
        <ExcelUploader setDocuments={setDocuments} />
        <div className="text-center my-4">
          <div className="mb-2">or</div>
          <MainComponent templates={templates} setDocuments={setDocuments} />
        </div>
        <div className="mb-4">
          <h3 className="mb-2 font-bold text-gray-700">Documents List</h3>
          <div className="max-h-40 overflow-y-auto">
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  name="documents"
                  value={doc}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-violet-500 truncate"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveDocument(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={transition.state === 'submitting'}
            className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${
              transition.state === 'submitting'
                ? 'bg-violet-400'
                : 'bg-violet-500 hover:bg-violet-600'
            }`}
          >
            {transition.state === 'submitting' ? 'Creating Template...' : 'Create Template'}
          </button>
        </div>
      </Form>
    </div>
  );
  
  
}

export async function action({ request }) {
  const formData = await request.formData();
  const templateName = formData.get('templateName');
  const documents = formData.getAll('documents');

  console.log('Template Name:', templateName);
  console.log('Documents:', documents);

  try {
    const result = await db.query(
      'INSERT INTO templates (template_name) VALUES ($1) RETURNING id',
      [templateName]
    );
    const templateId = result.rows[0].id;

    const docListData = documents.map((doc) => [doc, templateId]);

    await db.query(
      `INSERT INTO ${process.env.DOC_LIST_TABLE} (doc_name, template_type) SELECT * FROM UNNEST($1::text[], $2::int[])`,
      [documents, Array(documents.length).fill(templateId)]
    );

    return { success: true, templateId };
  } catch (error) {
    console.error('Error inserting data:', error);
    return { success: false, error: 'An error occurred while inserting data' };
  }
}

export async function loader() {
  const data = await db.query(`
    SELECT
      t.template_name,
      ARRAY_AGG(d.doc_name) AS doc_names
    FROM
      templates t
    LEFT JOIN
    ${process.env.DOC_LIST_TABLE} d ON t.id = d.template_type
    GROUP BY
      t.id, t.template_name;
  `);

  return data.rows;
}