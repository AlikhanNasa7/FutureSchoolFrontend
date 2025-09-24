import { redirect } from 'next/navigation';

export default async function SubjectIndex({
    params,
}: {
    params: Promise<{ id: number }>;
}) {
    const { id } = await params;
    // Check if the name is a numeric ID (subject-group ID) or a string name
    const isNumericId = /^\d+$/.test(id);

    if (isNumericId) {
        // If it's a numeric ID, redirect to contents with the ID
        redirect(`/subjects/${id}/contents`);
    } else {
        // If it's a string name, redirect to contents with the encoded name
        redirect(`/subjects/${encodeURIComponent(id)}/contents`);
    }
}
