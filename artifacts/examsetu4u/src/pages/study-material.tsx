import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Check, CheckCircle2, Lightbulb, LockKeyhole, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'wouter';
import { Breadcrumbs, EstimatedTime, ProgressBar } from '@/components/curriculum-ui';
import { Button, Card, Container, Layout, SectionTitle } from '@/components/site';
import { getExam, getStudyMaterial, getSubject, getTopic, getTopicsForSubject, type MaterialParagraph, type MaterialPoint } from '@/data/curriculum';
import { useProgress } from '@/lib/progress';
import { recordStudyProgress } from '@/lib/user-progress';
import NotFoundPage from '@/pages/not-found';

export default function StudyMaterialPage() {
  const { examId = '', subjectId = '', topicId = '' } = useParams<{ examId: string; subjectId: string; topicId: string }>();
  const exam = getExam(examId);
  const subject = getSubject(subjectId);
  const topic = getTopic(topicId);
  const material = getStudyMaterial(topicId);
  const subjectTopics = useMemo(() => subject ? getTopicsForSubject(subject.id) : [], [subject?.id]);
  const topicIndex = subjectTopics.findIndex((item) => item.id === topicId);
  const previousTopic = topicIndex > 0 ? subjectTopics[topicIndex - 1] : undefined;
  const nextTopic = topicIndex >= 0 && topicIndex < subjectTopics.length - 1 ? subjectTopics[topicIndex + 1] : undefined;
  const { getTopicProgress, setTopicProgress, resetTopicProgress, toggleBookmark, isBookmarked, readingProgress: savedReadingProgress, setReadingProgress } = useProgress();
  const [readingProgress, setReadingProgressState] = useState(() => topic ? (savedReadingProgress[topic.id] ?? 0) : 0);
  const validTopic = Boolean(exam && subject && topic && subject.examId === exam.id && topic.subjectId === subject.id);
  const completed = topic ? getTopicProgress(topic.id) === 100 : false;
  const bookmarked = topic ? isBookmarked(topic.id) : false;

  useEffect(() => {
    if (!material || !topic) return;
    setReadingProgressState(savedReadingProgress[topic.id] ?? 0);
    const updateReadingProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollable > 0 ? Math.round((window.scrollY / scrollable) * 100) : 100;
      const safeProgress = Math.max(0, Math.min(100, nextProgress));
      setReadingProgress(topic.id, safeProgress);
      setReadingProgressState(safeProgress);
    };
    updateReadingProgress();
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    window.addEventListener('resize', updateReadingProgress);
    return () => {
      window.removeEventListener('scroll', updateReadingProgress);
      window.removeEventListener('resize', updateReadingProgress);
    };
  }, [material, topic?.id]);

  if (!validTopic || !exam || !subject || !topic) return <NotFoundPage />;

  const topicPath = (id: string) => `/study-material/${exam.id}/${subject.id}/${id}`;

  if (!topic.availability.studyMaterial || !material) {
    return <Layout>
      <section className="paper-grid border-b border-[hsl(var(--border))] py-10 sm:py-14">
        <Container>
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Exams', href: '/exams' }, { label: exam.name, href: `/exams/${exam.id}` }, { label: subject.name, href: `/exams/${exam.id}/${subject.id}` }, { label: topic.name }]} />
          <div className="mt-8 max-w-2xl">
            <p className="eyebrow">Study material</p>
            <h1 className="font-display mt-2 text-3xl tracking-[-.035em] text-[hsl(var(--primary))] sm:text-5xl">This chapter is being prepared.</h1>
            <p className="mt-4 text-base leading-7 text-[hsl(var(--muted-foreground))]">The topic path is ready, but notes for {topic.name} have not been added yet. Choose another topic or return to the subject route.</p>
          </div>
        </Container>
      </section>
      <section className="py-12 sm:py-16">
        <Container>
          <Card className="max-w-2xl border-dashed p-6 sm:p-8">
            <div className="flex items-start gap-4"><LockKeyhole className="mt-1 shrink-0 text-[hsl(var(--accent-foreground))]" /><div><h2 className="text-xl font-bold text-[hsl(var(--primary))]">Notes unavailable for now</h2><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">You can still browse the topic outline and come back when this reader is updated.</p><Link href={`/exams/${exam.id}/${subject.id}`} className="focus-ring mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))]">Back to topics <ArrowRight size={15} /></Link></div></div>
          </Card>
        </Container>
      </section>
    </Layout>;
  }

  const materialText = (value: MaterialParagraph | MaterialPoint) => typeof value === 'string' ? value : value.text;

  return (
    <Layout>
      <section className="paper-grid border-b border-blue-100 bg-blue-50/40 py-8 sm:py-12">
        <Container>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Exams', href: '/exams' },
              { label: exam.name, href: `/exams/${exam.id}` },
              { label: subject.name, href: `/exams/${exam.id}/${subject.id}` },
              { label: topic.name },
            ]}
          />
          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle
              eyebrow={`${exam.name} · ${subject.name}`}
              title={topic.name}
              description={material.intro}
              as="h1"
            />
            <div className="w-full shrink-0 lg:max-w-xs">
              <ProgressBar value={readingProgress} label="Reading progress" />
              <div className="mt-3 flex items-center justify-between gap-3">
                <EstimatedTime minutes={topic.estimatedMinutes} />
                <span className="text-xs font-bold text-blue-700">{readingProgress}% read</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-9 sm:py-14 bg-white">
        <Container>
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start lg:gap-12">
            <article className="min-w-0">
              <div className="print-hide mb-7 flex flex-col gap-3 rounded-2xl border border-blue-200/90 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <CheckCircle2 size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {completed ? 'Topic completed' : 'Study at your pace'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {completed ? 'Your progress is saved on this device.' : 'Mark this topic complete when your revision is done.'}
                    </p>
                  </div>
                </div>
                <div className="flex w-full gap-2 sm:w-auto">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1 sm:flex-none text-xs font-bold"
                    onClick={() => window.print()}
                    aria-label="Print study material"
                  >
                    <Printer size={16} />
                    <span className="sr-only sm:not-sr-only">Print</span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1 sm:flex-none text-xs font-bold"
                    onClick={() => topic && toggleBookmark(topic.id)}
                    aria-pressed={bookmarked}
                    data-testid="button-bookmark-topic"
                  >
                    {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    {bookmarked ? 'Bookmarked' : 'Bookmark'}
                  </Button>
                  <Button
                    type="button"
                    variant={completed ? 'secondary' : 'primary'}
                    className="flex-1 sm:flex-none text-xs font-bold"
                    onClick={() => {
                      if (completed) {
                        resetTopicProgress(topic.id);
                        recordStudyProgress(topic.id, 0);
                      } else {
                        setTopicProgress(topic.id, 100);
                        recordStudyProgress(topic.id, 100);
                      }
                    }}
                    data-testid="button-complete-topic"
                  >
                    {completed ? (
                      <>
                        <Check size={16} /> Reset
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} /> Complete
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {material.callouts.map((callout) => (
                <aside
                  key={callout.title}
                  className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/50 p-5 sm:p-6"
                  data-testid={`callout-${callout.label.toLowerCase().replaceAll(' ', '-')}`}
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="mt-0.5 shrink-0 text-blue-700" size={20} />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-700">{callout.label}</p>
                      <h2 className="mt-1 text-base sm:text-lg font-bold text-slate-900">{callout.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">{callout.body}</p>
                    </div>
                  </div>
                </aside>
              ))}

              <div className="space-y-12 pt-3">
                {material.sections.map((section, index) => (
                  <section
                    key={section.heading}
                    id={`section-${index + 1}`}
                    className="scroll-mt-28"
                    data-testid={`reader-section-${index + 1}`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Chapter {String(index + 1).padStart(2, '0')}</p>
                    <h2 className="font-display mt-2 text-2xl tracking-tight text-slate-900 sm:text-3xl">
                      {section.heading}
                    </h2>
                    {section.subheading && (
                      <h3 className="mt-4 text-base font-bold text-slate-800">{section.subheading}</h3>
                    )}
                    <div className="mt-4 space-y-4 text-[15px] leading-7 text-slate-700">
                      {section.paragraphs.map((paragraph, paragraphIndex) => (
                        <p
                          key={`${section.heading}-paragraph-${paragraphIndex}`}
                          className={typeof paragraph === 'object' && paragraph.emphasis ? 'font-semibold text-slate-900' : undefined}
                        >
                          {materialText(paragraph)}
                        </p>
                      ))}
                    </div>
                    {section.bullets && (
                      <ul className="mt-5 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50/30 p-5 text-sm leading-6 text-slate-700 sm:p-6">
                        {section.bullets.map((bullet, bulletIndex) => (
                          <li key={`${section.heading}-bullet-${bulletIndex}`} className="flex gap-3">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                            {materialText(bullet)}
                          </li>
                        ))}
                      </ul>
                    )}
                    {section.numberedPoints && (
                      <ol className="mt-5 grid list-decimal gap-3 rounded-2xl border border-slate-200 bg-white p-5 pl-10 text-sm leading-6 text-slate-700 sm:p-6 sm:pl-10">
                        {section.numberedPoints.map((point, pointIndex) => (
                          <li key={`${section.heading}-number-${pointIndex}`}>
                            {materialText(point)}
                          </li>
                        ))}
                      </ol>
                    )}
                    {section.tables?.map((table, tableIndex) => (
                      <div
                        key={`${section.heading}-table-${tableIndex}`}
                        className="mt-5 overflow-x-auto rounded-2xl border border-slate-200"
                      >
                        <table className="min-w-full text-left text-sm">
                          <thead className="bg-blue-50/70 border-b border-slate-200">
                            <tr>
                              {table.headers.map((header) => (
                                <th key={header} scope="col" className="px-4 py-3 font-bold text-slate-900">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {table.rows.map((row, rowIndex) => (
                              <tr
                                key={`${section.heading}-row-${rowIndex}`}
                                className="border-t border-slate-100 hover:bg-slate-50/60 transition"
                              >
                                {row.map((cell, cellIndex) => (
                                  <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3 align-top text-slate-600">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                    {section.images?.map((image) => (
                      <figure key={image.src} className="mt-5">
                        <img src={image.src} alt={image.alt} className="max-h-96 w-full rounded-2xl object-cover" />
                        {image.caption && (
                          <figcaption className="mt-2 text-center text-xs text-slate-500">
                            {image.caption}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                    {section.questions?.map((question) => (
                      <details
                        key={question.prompt}
                        className="mt-5 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200"
                      >
                        <summary className="cursor-pointer font-bold text-slate-900">
                          {question.prompt}
                        </summary>
                        {question.answer && (
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {question.answer}
                          </p>
                        )}
                      </details>
                    ))}
                  </section>
                ))}
              </div>

              {/* Special highlight section: Quick revision */}
              <div
                className="mt-12 rounded-2xl border border-blue-700 bg-gradient-to-r from-blue-800 to-indigo-900 p-6 text-white sm:p-8 shadow-xs"
                data-testid="panel-key-takeaways"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Quick revision</p>
                <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-white">
                  Keep these points close before the exam.
                </h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {material.quickRevision.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm leading-6 text-blue-100">
                      <Check size={16} className="mt-1 shrink-0 text-blue-300" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exam-ready recap */}
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-blue-700" size={20} />
                  <div>
                    <h2 className="font-bold text-slate-900">Exam-ready recap</h2>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                      {material.keyTakeaways.map((takeaway) => (
                        <li key={takeaway} className="flex gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          {takeaway}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {previousTopic ? (
                  <Button href={topicPath(previousTopic.id)} variant="secondary" className="justify-start text-left font-bold">
                    <ArrowLeft size={16} />
                    <span>
                      <span className="block text-[11px] font-semibold text-slate-500">Previous topic</span>
                      <span className="mt-0.5 block truncate text-slate-900">{previousTopic.name}</span>
                    </span>
                  </Button>
                ) : (
                  <span />
                )}
                {nextTopic ? (
                  <Button href={topicPath(nextTopic.id)} variant="secondary" className="justify-end text-right font-bold">
                    <span>
                      <span className="block text-[11px] font-semibold text-slate-500">Next topic</span>
                      <span className="mt-0.5 block truncate text-slate-900">{nextTopic.name}</span>
                    </span>
                    <ArrowRight size={16} />
                  </Button>
                ) : (
                  <span />
                )}
              </div>
            </article>

            {/* Sidebar navigation */}
            <aside className="print-hide lg:sticky lg:top-24">
              <Card className="p-5 border border-slate-200/90 shadow-2xs rounded-2xl">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">In this chapter</p>
                <nav className="mt-4 grid gap-1" aria-label="Study material sections">
                  {material.sections.map((section, index) => (
                    <a
                      key={section.heading}
                      href={`#section-${index + 1}`}
                      className="focus-ring rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition"
                      data-testid={`link-reader-section-${index + 1}`}
                    >
                      {String(index + 1).padStart(2, '0')}{' '}
                      <span className="ml-1">{section.heading}</span>
                    </a>
                  ))}
                </nav>
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Topic status</p>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-600 text-xs font-medium">Progress saved</span>
                    <span className="font-bold text-blue-700">{getTopicProgress(topic.id)}%</span>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${getTopicProgress(topic.id)}%` }}
                    />
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </Container>
      </section>
    </Layout>
  );
}