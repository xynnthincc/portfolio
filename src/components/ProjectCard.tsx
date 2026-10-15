import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectCardProps {
  project: {
    id: number;
    number: string;
    title: string;
    description: string;
    detailedDescription?: string;
    role?: string;
    year?: string;
    type?: string;
    tech: { label: string; icon?: string }[];
    imageSrc: string;
    /** Only set when the project is actually deployed. */
    link?: string;
    /** Source on GitHub. */
    repo?: string;
  };
  index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = React.memo(
  ({ project, index }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const pattern = index % 4;
    let numberPositionClasses = "";
    let contentAlignmentClasses = "";
    let imageOrderClass = "";
    let textOrderClass = "";

    switch (pattern) {
      case 0:
        numberPositionClasses = "top-4 left-4";
        contentAlignmentClasses = "text-right items-end";
        textOrderClass = "order-1";
        imageOrderClass = "order-2";
        break;
      case 1:
        numberPositionClasses = "bottom-4 left-4";
        contentAlignmentClasses = "text-right items-end";
        textOrderClass = "order-2";
        imageOrderClass = "order-1";
        break;
      case 2:
        numberPositionClasses = "top-4 right-4";
        contentAlignmentClasses = "text-left items-start";
        textOrderClass = "order-1";
        imageOrderClass = "order-2";
        break;
      case 3:
        numberPositionClasses = "bottom-4 right-4";
        contentAlignmentClasses = "text-left items-start";
        textOrderClass = "order-2";
        imageOrderClass = "order-1";
        break;
    }

    const handleOpenModal = useCallback(() => {
      setIsModalOpen(true);
      document.body.style.overflow = "hidden"; // lock scroll
    }, []);

    const handleCloseModal = useCallback(() => {
      setIsModalOpen(false);
      document.body.style.overflow = ""; // unlock scroll
    }, []);

    // ESC key support
    useEffect(() => {
      if (!isModalOpen) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") handleCloseModal();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isModalOpen, handleCloseModal]);

    return (
      <>
        <motion.div className="relative flex flex-col justify-between py-6 px-15 md:m-0 m-5 border border-white border-opacity-20 bg-transparent overflow-hidden h-full">
          <div
            className={`absolute md:text-6xl text-3xl p-6 font-bold text-white text-opacity-10 ${numberPositionClasses}`}
          >
            {project.number}
          </div>

          <div
            className="flex flex-col justify-between h-full cursor-pointer"
            onClick={handleOpenModal}
          >
            <div
              className={`flex flex-col ${contentAlignmentClasses} ${textOrderClass} z-10 p-6`}
            >
              <div>
                <h3 className="md:text-xl text-md font-semibold text-white">
                  {project.title}
                </h3>
                <p className="md:text-sm text-xs text-gray-400">
                  {project.description}
                </p>
              </div>
              <div className="mt-3">
                <div className="flex flex-wrap gap-1.5">
                  {project.tech.map((tech) => (
                    <span
                      key={tech.label}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/70"
                    >
                      {tech.icon && (
                        <Image src={tech.icon} alt="" width={14} height={14} loading="lazy" />
                      )}
                      {tech.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <motion.div
              className={`relative w-full flex-grow rounded-xl overflow-hidden z-10 ${imageOrderClass}`}
              initial={{ opacity: 0.7 }}
              whileHover={{ opacity: 1, scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={project.imageSrc}
                alt={`${project.title} image`}
                width={500}
                height={500}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover w-full h-full"
              />
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={handleCloseModal}
            >
              <motion.div
                initial={{ y: 24, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 24, opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                {/* ── Hero image header ── */}
                <div className="relative h-52 md:h-64 shrink-0 overflow-hidden">
                  <Image
                    src={project.imageSrc}
                    alt={`${project.title} preview`}
                    fill
                    className="object-cover"
                  />
                  {/* gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                  {/* controls row on top of image */}
                  <div className="absolute top-3 right-3 flex gap-2 z-10">
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 rounded-full transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                        Visit Live
                      </a>
                    )}
                    {project.repo && (
                      <a
                        href={project.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 rounded-full transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 014 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                        View Code
                      </a>
                    )}
                    <button
                      onClick={handleCloseModal}
                      aria-label="Close modal"
                      className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 rounded-full transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* title + tags overlaid on bottom of image */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <div className="flex flex-wrap gap-1.5 mb-2 text-white">
                      {project.tech.map((tech) => (
                        <span
                          key={tech.label}
                          className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-zinc-900/80 backdrop-blur-md border border-white/10"
                        >
                          {tech.icon && (
                            <Image src={tech.icon} alt="" width={14} height={14} loading="lazy" />
                          )}
                          {tech.label}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                      {project.title}
                    </h2>
                    <p className="text-sm text-white/50 mt-0.5">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* ── Scrollable body ── */}
                <div className="overflow-y-auto px-5 pb-6 pt-4 flex flex-col gap-4">
                  {/* stat pills */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Role", value: project.role ?? "Developer" },
                      { label: "Year", value: project.year ?? "2024" },
                      { label: "Type", value: project.type ?? "Web App" },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5"
                      >
                        <p className="text-[10px] uppercase tracking-wider text-white/35 mb-1">
                          {label}
                        </p>
                        <p className="text-sm font-medium text-white">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* description */}
                  <div className="text-sm text-white/55 leading-relaxed font-light mt-1">
                    {project.detailedDescription && (
                      <p>{project.detailedDescription}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }
);

ProjectCard.displayName = "ProjectCard";

export default ProjectCard;