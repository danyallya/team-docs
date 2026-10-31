export async function seedLibrary(db) {
  await db.$transaction([
    db.user.upsert({ where: { id: 'sample-author' }, update: { name: 'Nora Ellis', email: 'nora@example.com' }, create: { id: 'sample-author', name: 'Nora Ellis', email: 'nora@example.com' } }),
    db.workspace.upsert({ where: { id: 'sample-studio' }, update: { name: 'Northline Studio', slug: 'northline-studio' }, create: { id: 'sample-studio', name: 'Northline Studio', slug: 'northline-studio' } }),
    db.workspace.upsert({ where: { id: 'sample-field-notes' }, update: { name: 'Field Notes', slug: 'field-notes' }, create: { id: 'sample-field-notes', name: 'Field Notes', slug: 'field-notes' } }),
    db.membership.upsert({ where: { userId_workspaceId: { userId: 'sample-author', workspaceId: 'sample-studio' } }, update: {}, create: { id: 'sample-membership', userId: 'sample-author', workspaceId: 'sample-studio', role: 'OWNER' } }),
    db.membership.upsert({ where: { userId_workspaceId: { userId: 'sample-author', workspaceId: 'sample-field-notes' } }, update: {}, create: { id: 'sample-field-notes-membership', userId: 'sample-author', workspaceId: 'sample-field-notes', role: 'EDITOR' } }),
    db.document.upsert({ where: { id: 'sample-brief' }, update: {}, create: { id: 'sample-brief', workspaceId: 'sample-studio', authorId: 'sample-author', title: 'Fictional studio brief', summary: 'Setup fixture only.', body: 'Synthetic working notes; no private team content.', status: 'DRAFT' } }),
    db.revision.upsert({ where: { documentId_version: { documentId: 'sample-brief', version: 1 } }, update: {}, create: { id: 'sample-revision', documentId: 'sample-brief', version: 1, body: 'Synthetic working notes; no private team content.', editorName: 'Fictional editor' } }),
  ]);
}
