export async function seedLibrary(db) {
  await db.$transaction([
    db.user.upsert({ where: { id: 'sample-author' }, update: {}, create: { id: 'sample-author', name: 'Fictional editor', email: 'editor@example.com' } }),
    db.workspace.upsert({ where: { id: 'sample-studio' }, update: {}, create: { id: 'sample-studio', name: 'Synthetic studio', slug: 'synthetic-studio' } }),
    db.membership.upsert({ where: { userId_workspaceId: { userId: 'sample-author', workspaceId: 'sample-studio' } }, update: {}, create: { id: 'sample-membership', userId: 'sample-author', workspaceId: 'sample-studio', role: 'OWNER' } }),
    db.document.upsert({ where: { id: 'sample-brief' }, update: {}, create: { id: 'sample-brief', workspaceId: 'sample-studio', authorId: 'sample-author', title: 'Fictional studio brief', summary: 'Setup fixture only.', body: 'Synthetic working notes; no private team content.', status: 'DRAFT' } }),
    db.revision.upsert({ where: { documentId_version: { documentId: 'sample-brief', version: 1 } }, update: {}, create: { id: 'sample-revision', documentId: 'sample-brief', version: 1, body: 'Synthetic working notes; no private team content.', editorName: 'Fictional editor' } }),
  ]);
}
