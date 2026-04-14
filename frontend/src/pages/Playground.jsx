import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import GeneratorPanel from '../components/GeneratorPanel.jsx';
import MembershipPanel from '../components/MembershipPanel.jsx';
import EquivalencePanel from '../components/EquivalencePanel.jsx';

const GENERATE_MAX_LENGTH = 3;
const SAMPLE_MAX_LENGTH = 20;

/** 🔥 Single source of truth */
const API = "https://tafl-visualisation-project.onrender.com/api";

export default function Playground() {
  const location = useLocation();
  const [regex, setRegex] = useState('(a|b)*');

  const [groupedStrings, setGroupedStrings] = useState(null);
  const [allStrings, setAllStrings] = useState([]);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');

  const [sampledStrings, setSampledStrings] = useState([]);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [sampleMessage, setSampleMessage] = useState('');

  useEffect(() => {
    const init = location.state?.initialRegex;
    if (init) setRegex(init);
  }, [location.state]);

  // ✅ GENERATE
  async function handleGenerate() {
    setGenError('');
    setGenLoading(true);
    setSampledStrings([]);
    setSampleMessage('');

    try {
      const res = await fetch(`${API}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regex, maxLength: GENERATE_MAX_LENGTH }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setGroupedStrings(data.groupedStrings);
      setAllStrings(data.allStrings || []);
    } catch (e) {
      setGroupedStrings(null);
      setAllStrings([]);
      setGenError(e.message);
    } finally {
      setGenLoading(false);
    }
  }

  // ✅ SAMPLE
  async function handleSampleMore() {
    if (!groupedStrings) return;

    setSampleLoading(true);
    setSampleMessage('');

    try {
      const res = await fetch(`${API}/sample`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regex,
          maxLength: SAMPLE_MAX_LENGTH,
          existingStrings: allStrings,
          sampledStrings,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sampling failed');

      if (data.message) setSampleMessage(data.message);
      if (data.newSamples?.length) {
        setSampledStrings((prev) => [...prev, ...data.newSamples]);
      }
    } catch (e) {
      setSampleMessage(e.message);
    } finally {
      setSampleLoading(false);
    }
  }

  // 🔥 NEW: MEMBERSHIP (centralized)
  async function handleMembershipCheck(testString) {
    const res = await fetch(`${API}/membership`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        regex,
        string: testString
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");

    return data.accepted;
  }

  // 🔥 NEW: EQUIVALENCE (centralized)
  async function handleEquivalenceCheck(regex1, regex2, maxLength) {
    const res = await fetch(`${API}/equivalence`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        regex1,
        regex2,
        maxLength
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");

    return data;
  }

  return (
    <div>
      <div className="panel-grid">
        <GeneratorPanel
          regex={regex}
          onRegexChange={setRegex}
          onGenerate={handleGenerate}
          genLoading={genLoading}
          genError={genError}
          groupedStrings={groupedStrings}
          onSampleMore={handleSampleMore}
          sampleLoading={sampleLoading}
          sampledStrings={sampledStrings}
          sampleMessage={sampleMessage}
        />

        {/* 🔥 FIXED */}
        <MembershipPanel
          regex={regex}
          onCheck={handleMembershipCheck}
        />

        {/* 🔥 FIXED */}
        <EquivalencePanel
          onCheck={handleEquivalenceCheck}
        />
      </div>
    </div>
  );
}