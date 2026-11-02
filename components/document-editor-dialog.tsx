"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { documentTypeValues, validateDocumentDraft, type DocumentDraft, type DocumentDraftErrors } from "@/lib/document-input";
import type { DocumentDetail } from "@/lib/document-view";

const blankDraft: DocumentDraft = {
  title: "",
  summary: "",
  type: "STUDIO_GUIDE",
  body: "",
};

type Props = {
  workspaceId: string;
  workspaceName: string;
  existingDocument: DocumentDetail | null;
  onClose: () => void;
  onSaved: (document: DocumentDetail) => void;
};

export function DocumentEditorDialog({ workspaceId, workspaceName, existingDocument, onClose, onSaved }: Props) {
  const editing = existingDocument !== null;
  const [draft, setDraft] = useState<DocumentDraft>(() => existingDocument
    ? { title: existingDocument.title, summary: existingDocument.summary, type: existingDocument.type as DocumentDraft["type"], body: existingDocument.body }
    : blankDraft);
  const [errors, setErrors] = useState<DocumentDraftErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const firstField = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const savingRef = useRef(saving);
  savingRef.current = saving;

  useEffect(() => {
    const returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    firstField.current?.focus();

    function containDialogFocus(event: KeyboardEvent) {
      if (event.key === "Escape" && !savingRef.current) {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", containDialogFocus);
    return () => {
      window.removeEventListener("keydown", containDialogFocus);
      returnFocusTo?.focus();
    };
  }, [onClose]);

  function change(field: keyof DocumentDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = validateDocumentDraft(draft);
    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const path = editing
        ? `/api/workspaces/${encodeURIComponent(workspaceId)}/documents/${encodeURIComponent(existingDocument.id)}`
        : `/api/workspaces/${encodeURIComponent(workspaceId)}/documents`;
      const response = await fetch(path, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(parsed.data),
      });
      const payload = await response.json() as { document?: DocumentDetail; fields?: DocumentDraftErrors };
      if (response.status === 400 && payload.fields) {
        setErrors(payload.fields);
        setFormError("Review the highlighted document fields.");
        return;
      }
      if (!response.ok || !payload.document) throw new Error("Document write failed");
      onSaved(payload.document);
    } catch {
      setFormError("We couldn't save this document. No changes were applied; check the local library and try again.");
    } finally {
      setSaving(false);
    }
  }

  const typeLabels = {
    STUDIO_GUIDE: "Studio guide",
    PROJECT_BRIEF: "Project brief",
    RESEARCH: "Research",
    OPERATIONS: "Operations",
  } as const;

  function fieldError(field: keyof DocumentDraft) {
    return errors[field] ? <small id={`${field}-error`} className="field-error">{errors[field]}</small> : null;
  }

  return (
    <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <section ref={dialogRef} className="dialog document-editor" role="dialog" aria-modal="true" aria-labelledby="document-editor-title">
        <button className="close" type="button" onClick={onClose} aria-label="Close document editor" disabled={saving}>×</button>
        <small>{editing ? "UPDATE YOUR LIBRARY" : "ADD TO YOUR LIBRARY"}</small>
        <h2 id="document-editor-title">{editing ? "Edit document" : "Create a document"}</h2>
        <p>{workspaceName} · Changes are saved to the local sample library. This demo has no staff sign-in.</p>
        <form onSubmit={submit} noValidate>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <label htmlFor="document-title">Document title</label>
          <input ref={firstField} id="document-title" value={draft.title} maxLength={140} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "title-error" : undefined} onChange={(event) => change("title", event.target.value)} />
          {fieldError("title")}

          <label htmlFor="document-summary">Short summary</label>
          <input id="document-summary" value={draft.summary} maxLength={300} aria-invalid={Boolean(errors.summary)} aria-describedby={errors.summary ? "summary-error" : undefined} onChange={(event) => change("summary", event.target.value)} />
          {fieldError("summary")}

          <label htmlFor="document-type">Document type</label>
          <select id="document-type" value={draft.type} aria-invalid={Boolean(errors.type)} aria-describedby={errors.type ? "type-error" : undefined} onChange={(event) => change("type", event.target.value)}>
            {documentTypeValues.map((value) => <option key={value} value={value}>{typeLabels[value]}</option>)}
          </select>
          {fieldError("type")}

          <label htmlFor="document-body">Document content</label>
          <textarea id="document-body" rows={7} maxLength={22_000} value={draft.body} aria-invalid={Boolean(errors.body)} aria-describedby={errors.body ? "body-error" : undefined} onChange={(event) => change("body", event.target.value)} />
          {fieldError("body")}
          {editing && <small className="editor-note">The original author stays on the document. A new body revision is saved when content changes.</small>}
          <div className="editor-actions">
            <button type="button" className="editor-cancel" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="create-button" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Create document"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
