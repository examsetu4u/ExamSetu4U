import { BookOpen, CheckCircle, FileText, Info, Sparkles } from 'lucide-react';
import type { AdminStudyMaterial } from '../types';

interface StudyMaterialPreviewProps {
  material: AdminStudyMaterial;
  className?: string;
}

export function StudyMaterialPreview({ material, className = '' }: StudyMaterialPreviewProps) {
  return (
    <article
      className={`rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-[hsl(var(--card-foreground))] shadow-sm ${className}`}
      data-testid={`study-material-preview-${material.id}`}
    >
      {/* Student View Simulation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--primary))]">
            Student Preview • v{material.version}
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            {material.title}
          </h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{material.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              material.status === 'PUBLISHED'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : material.status === 'REVIEW'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {material.status}
          </span>
        </div>
      </div>

      {/* Chapter Intro */}
      {material.intro && (
        <div className="mt-5 rounded-lg border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--muted)/0.4)] p-4 text-sm leading-relaxed text-[hsl(var(--foreground))]">
          <div className="flex items-center gap-1.5 font-bold text-[hsl(var(--primary))] mb-1">
            <BookOpen className="h-4 w-4" />
            Chapter Overview
          </div>
          {material.intro}
        </div>
      )}

      {/* Sections */}
      <div className="mt-6 space-y-6">
        {material.sections.map((section, sIdx) => (
          <section key={sIdx} className="border-t border-[hsl(var(--border)/0.6)] pt-5 first:border-0 first:pt-0">
            <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">
              {section.heading}
            </h3>
            {section.subheading && (
              <h4 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] mt-0.5">
                {section.subheading}
              </h4>
            )}

            {/* Paragraphs */}
            <div className="mt-2.5 space-y-2">
              {section.paragraphs.map((p, pIdx) => {
                const text = typeof p === 'string' ? p : p.text;
                const isEmphasis = typeof p === 'object' && p.emphasis;
                return (
                  <p
                    key={pIdx}
                    className={`text-sm leading-relaxed ${
                      isEmphasis
                        ? 'font-medium text-[hsl(var(--primary))]'
                        : 'text-[hsl(var(--foreground)/0.9)]'
                    }`}
                  >
                    {text}
                  </p>
                );
              })}
            </div>

            {/* Bullets */}
            {section.bullets && section.bullets.length > 0 && (
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-[hsl(var(--foreground)/0.85)]">
                {section.bullets.map((b, bIdx) => (
                  <li key={bIdx} className="leading-snug">
                    {typeof b === 'string' ? b : b.text}
                  </li>
                ))}
              </ul>
            )}

            {/* Numbered Points */}
            {section.numberedPoints && section.numberedPoints.length > 0 && (
              <ol className="mt-3 list-inside list-decimal space-y-1.5 text-sm text-[hsl(var(--foreground)/0.85)]">
                {section.numberedPoints.map((np, npIdx) => (
                  <li key={npIdx} className="leading-snug">
                    {typeof np === 'string' ? np : np.text}
                  </li>
                ))}
              </ol>
            )}

            {/* Table */}
            {section.tables && section.tables.length > 0 && (
              <div className="mt-4 overflow-x-auto rounded-lg border border-[hsl(var(--border))]">
                {section.tables.map((tbl, tIdx) => (
                  <table key={tIdx} className="w-full text-left text-xs">
                    <thead className="bg-[hsl(var(--muted))] font-bold text-[hsl(var(--foreground))]">
                      <tr>
                        {tbl.headers.map((h, hIdx) => (
                          <th key={hIdx} className="p-2.5 border-b border-[hsl(var(--border))]">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--border))]">
                      {tbl.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-[hsl(var(--muted)/0.3)]">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2.5">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Key Takeaways & Revision Grid */}
      {(material.keyPoints.length > 0 || material.importantFacts.length > 0) && (
        <div className="mt-8 grid grid-cols-1 gap-4 border-t border-[hsl(var(--border))] pt-6 sm:grid-cols-2">
          {material.keyPoints.length > 0 && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                Key Exam Takeaways
              </h4>
              <ul className="mt-2.5 space-y-1.5 text-xs text-[hsl(var(--foreground))]">
                {material.keyPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {material.importantFacts.length > 0 && (
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                <Sparkles className="h-4 w-4" />
                Quick Revision Facts
              </h4>
              <ul className="mt-2.5 space-y-1.5 text-xs text-[hsl(var(--foreground))]">
                {material.importantFacts.map((fact, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
