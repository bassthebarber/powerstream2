// frontend/src/components/tv/ScheduleGrid.jsx
// TV schedule grid component

import React, { useState, useEffect } from 'react';
import { fetchStationSchedule, getDayName, getCurrentDay } from './tvUtils.js';

export default function ScheduleGrid({
  stationSlug,
  schedule: propSchedule = null,
  showDaySelector = true,
  className = '',
}) {
  const [schedule, setSchedule] = useState(propSchedule || []);
  const [loading, setLoading] = useState(!propSchedule);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());

  // Fetch schedule if not provided
  useEffect(() => {
    if (propSchedule) {
      setSchedule(propSchedule);
      return;
    }

    const loadSchedule = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchStationSchedule(stationSlug, selectedDay);
        setSchedule(data);
      } catch (err) {
        console.error('Failed to load schedule:', err);
        setError('Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [stationSlug, selectedDay, propSchedule]);

  // Format time
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const date = new Date(`2000-01-01T${timeStr}`);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeStr;
    }
  };

  // Check if show is currently airing
  const isCurrentlyAiring = (show) => {
    if (show.day_of_week !== getCurrentDay()) return false;
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    return currentTime >= show.start_time && currentTime < show.end_time;
  };

  // Filter schedule for selected day
  const daySchedule = schedule.filter(s => s.day_of_week === selectedDay);

  if (loading) {
    return (
      <section className={`tv-schedule tv-schedule--loading ${className}`}>
        <h3 className="tv-schedule-title">Schedule</h3>
        <div className="tv-schedule-skeleton">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="tv-schedule-item tv-schedule-item--skeleton">
              <div className="tv-schedule-time-skeleton"></div>
              <div className="tv-schedule-show-skeleton"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`tv-schedule ${className}`}>
      <div className="tv-schedule-header">
        <h3 className="tv-schedule-title">Schedule</h3>
        
        {/* Day selector */}
        {showDaySelector && (
          <div className="tv-schedule-days">
            {[0, 1, 2, 3, 4, 5, 6].map(day => (
              <button
                key={day}
                className={`tv-schedule-day ${selectedDay === day ? 'tv-schedule-day--active' : ''} ${day === getCurrentDay() ? 'tv-schedule-day--today' : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                {getDayName(day).slice(0, 3)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="tv-schedule-error">
          <p>{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!error && daySchedule.length === 0 && (
        <div className="tv-schedule-empty">
          <span>📅</span>
          <p>No shows scheduled for {getDayName(selectedDay)}</p>
        </div>
      )}

      {/* Schedule list */}
      {daySchedule.length > 0 && (
        <div className="tv-schedule-list">
          {daySchedule.map((show, idx) => {
            const isAiring = isCurrentlyAiring(show);
            
            return (
              <div 
                key={show.id || idx}
                className={`tv-schedule-item ${isAiring ? 'tv-schedule-item--airing' : ''}`}
              >
                <div className="tv-schedule-time">
                  <span className="tv-schedule-start">{formatTime(show.start_time)}</span>
                  <span className="tv-schedule-separator">-</span>
                  <span className="tv-schedule-end">{formatTime(show.end_time)}</span>
                </div>
                <div className="tv-schedule-show">
                  <span className="tv-schedule-show-title">{show.show_title}</span>
                  {show.description && (
                    <span className="tv-schedule-show-desc">{show.description}</span>
                  )}
                  {isAiring && (
                    <span className="tv-schedule-live-badge">
                      <span className="tv-live-dot"></span>
                      NOW
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

