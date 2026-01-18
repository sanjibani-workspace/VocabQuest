import { redirect } from 'next/navigation';
import { getNextSession } from '@/app/actions/quest';

export default async function PlayPage() {
    // Get the current active session for the user
    const nextSession = await getNextSession();

    if (nextSession) {
        redirect(`/quest/${nextSession.session_number}`);
    } else {
        // If no active session (e.g. all completed), go back to home or show completion
        // For now, home is safest fallback.
        redirect('/home');
    }
}
