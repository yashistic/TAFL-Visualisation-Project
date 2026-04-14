function displayWord(w) {
  return w === '' ? 'ε' : w;
}

export default function GeneratorPanel({
  regex,
  onRegexChange,
  onGenerate,
  genLoading,
  genError,
  groupedStrings,
  onSampleMore,
  sampleLoading,
  sampledStrings,
  sampleMessage,
}) {
  const lengths = groupedStrings
    ? Object.keys(groupedStrings)
        .map(Number)
        .sort((a, b) => a - b)
    : [];

  return (
    <section className="panel" style={{ gridColumn: '1 / -1' }}>
      <p className="panel-label">Generator &amp; sample</p>
      <h2>String generator</h2>
      <div className="field-row">
        <div className="field" style={{ flex: 2 }}>
          <label htmlFor="gen-regex">Regular expression</label>
          <input
            id="gen-regex"
            value={regex}
            onChange={(e) => onRegexChange(e.target.value)}
            placeholder="(a|b)*"
            spellCheck={false}
          />
        </div>
        <button type="button" className="btn" onClick={onGenerate} disabled={genLoading}>
          {genLoading ? 'Generating…' : 'Generate strings'}
        </button>
      </div>
      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Listed strings include all members of lengths 0–3 only.
      </p>
      {genError ? <p className="error-text">{genError}</p> : null}

      {groupedStrings && lengths.length > 0 ? (
        <div className="output-block">
          {lengths.map((len) => (
            <div key={len} className="length-group">
              <div className="length-label">Length {len}:</div>
              <div className="strings-line">
                {groupedStrings[String(len)].map(displayWord).join(', ')}
              </div>
            </div>
          ))}
        </div>
      ) : groupedStrings && lengths.length === 0 ? (
        <div className="output-block">No strings within this bound.</div>
      ) : (
        <div className="output-block" style={{ color: 'var(--text-muted)' }}>
          Run generation to see strings grouped by length.
        </div>
      )}

      <div className="sample-section">
        <h3>Sampled examples</h3>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Draws new strings (up to length 20) not already shown above or in prior samples.
        </p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onSampleMore}
          disabled={sampleLoading || groupedStrings === null}
        >
          {sampleLoading ? 'Sampling…' : 'Generate 5 more examples'}
        </button>
        {sampleMessage ? <p className="error-text" style={{ marginTop: '0.75rem' }}>{sampleMessage}</p> : null}
        {sampledStrings.length > 0 ? (
          <div className="output-block compact" style={{ marginTop: '0.75rem' }}>
            {sampledStrings.map(displayWord).join(', ')}
          </div>
        ) : null}
      </div>
    </section>
  );
}
