import React, { memo } from "react";

function FeedSkeleton() {
  return (
    <div className="ps-ui-card ps-ui-skeleton">
      <div className="ps-ui-skeleton-line" />
      <div className="ps-ui-skeleton-line short" />
    </div>
  );
}

function FeedComposer({ value, onChange, onSubmit }) {
  return (
    <form className="ps-ui-card" onSubmit={onSubmit}>
      <h3>What's on your mind?</h3>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
      <button type="submit">Post</button>
    </form>
  );
}

function FeedInfiniteList({ items, renderItem, loading }) {
  return (
    <section>
      {items.map((item, idx) => (
        <div key={item.id || idx} className="ps-ui-card">
          {renderItem(item)}
        </div>
      ))}
      {loading && (
        <>
          <FeedSkeleton />
          <FeedSkeleton />
        </>
      )}
    </section>
  );
}

export const PowerFeedModule = memo(function PowerFeedModule(props) {
  const { composerValue, onComposerChange, onComposerSubmit, items = [], renderItem, loading } = props;
  return (
    <div className="ps-ui-feed">
      <FeedComposer value={composerValue} onChange={onComposerChange} onSubmit={onComposerSubmit} />
      <FeedInfiniteList items={items} renderItem={renderItem} loading={loading} />
    </div>
  );
});

export default PowerFeedModule;
