import {
    Form,
    useActionData,
    useNavigation
} from '@remix-run/react';

function NewNote() {
    const data = useActionData();
    const navigation = useNavigation();

    const isSubmitting = navigation.state === 'submitting';

    return (
        <Form method="post" id="note-form">
            {data?.message && <p>{data.message}</p>}
            <p>
                <label htmlFor="title">Title</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="border border-gray-300 rounded-md p-2"
                />
            </p>
            <p>
                <label htmlFor="content">Content</label>
                <textarea
                    id="content"
                    name="content"
                    rows="5"
                    required
                    className="border border-gray-300 rounded-md p-2"
                />
            </p>
            <div className="form-actions">
                <button
                    disabled={isSubmitting}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    {isSubmitting ? 'Adding...' : 'Add Note'}
                </button>
            </div>
        </Form>
    );
}

export default NewNote;
