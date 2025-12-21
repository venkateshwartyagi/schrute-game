import GameInterface from '@/app/components/GameInterface';
import { levels } from '@/lib/levels';
import { redirect } from 'next/navigation';

export default async function LevelPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const levelId = parseInt(params.id, 10);
    const level = levels.find(l => l.id === levelId);

    if (!level) {
        redirect('/level/1');
    }

    return (
        <main className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-6xl mx-auto mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">SCHRUTE <span className="text-[var(--accent-mustard)]">APP</span></h1>
                <p className="text-gray-500">Security Training Module // Level {levelId}</p>
            </div>
            <GameInterface initialLevelId={levelId} />
        </main>
    );
}
