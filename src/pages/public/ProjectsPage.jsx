import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useProjects from '../../hooks/useProjects';
import useAuth from '../../hooks/useAuth';
import ProjectCard from '../../components/project/ProjectCard';
import SkeletonBlock from '../../components/common/SkeletonBlock';
import './Home.css';

export default function ProjectsPage() {
  const { projects, loading } = useProjects();
  const { savedProjectIds, toggleSavedProject, isAuthenticated } = useAuth();

  return (
    <section className="section-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 className="section-title">All <span className="heading-accent">Projects</span></h1>
          <p className="section-subtitle">Explore featured launches, ready inventory, and plotted communities from Purandar Properties.</p>
        </div>
        <Link to="/" className="activity-btn" style={{ textDecoration: 'none' }}>
          Back Home <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="project-grid">
          {[1, 2, 3].map((item) => (
            <div key={item} className="project-card">
              <SkeletonBlock style={{ height: 180 }} />
              <div className="project-info" style={{ display: 'grid', gap: 10 }}>
                <SkeletonBlock style={{ height: 18, width: '70%' }} />
                <SkeletonBlock style={{ height: 14, width: '55%' }} />
                <SkeletonBlock style={{ height: 14, width: '60%' }} />
                <SkeletonBlock style={{ height: 16, width: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              isSaved={savedProjectIds.has(project._id)}
              onToggleSave={isAuthenticated ? toggleSavedProject : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
