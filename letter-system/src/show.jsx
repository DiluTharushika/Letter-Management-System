import { useEffect, useState } from "react";
import "./Show.css";

const Show = () => {
  const [letters, setLetters] = useState([]);
  const [filteredLetters, setFilteredLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch letters
  const fetchLetters = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/letters");
      if (!res.ok) throw new Error("Failed to fetch letters");
      const data = await res.json();
      setLetters(data);
      setFilteredLetters(data);
    } catch (err) {
      setError("Error fetching letters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  // Handle field changes
  const handleInputChange = (id, field, value) => {
    const updatedLetters = letters.map((letter) =>
      letter.id === id ? { ...letter, [field]: value } : letter
    );
    setLetters(updatedLetters);
    setFilteredLetters(updatedLetters);
  };

  // Submit all updates
  const handleSubmitAll = async () => {
    try {
      for (const letter of letters) {
        setSavingId(letter.id);

        const payload = {
          ...letter,
          sent_date: letter.sent_date ? new Date(letter.sent_date).toISOString() : null,
          letter_date: letter.letter_date ? new Date(letter.letter_date).toISOString() : null,
        };

        await fetch(`http://localhost:5000/api/letters/${letter.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      // Notify User.jsx to refetch
      window.dispatchEvent(new Event("lettersUpdated"));
      alert("✅ All letters updated successfully!");
    } catch (err) {
      console.error("Failed to save all:", err);
      alert("❌ Failed to save all changes");
    } finally {
      setSavingId(null);
    }
  };

  // Search
  useEffect(() => {
    if (!searchTerm) return setFilteredLetters(letters);
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = letters.filter((letter) =>
      ["subject_no", "details", "letter_type", "address"].some(
        (key) => letter[key]?.toLowerCase().includes(lowerTerm)
      ) ||
      (letter.letter_date?.split("T")[0].includes(lowerTerm)) ||
      (letter.sent_date?.split("T")[0].includes(lowerTerm))
    );
    setFilteredLetters(filtered);
  }, [searchTerm, letters]);

  if (loading) return <div className="show-container">Loading letters...</div>;
  if (error) return <div className="show-container error-msg">{error}</div>;

  return (
    <div className="show-container">
      <h2>දෛනික තැපෑල</h2>

      <input
        type="text"
        placeholder="Search all letters..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <table className="letters-table">
        <thead>
          <tr>
            <th>විෂය අංකය</th>
            <th>ලිපිය ලබා ගත් දිනය</th>
            <th>ලිපියට දැක් වූ ප්‍රතිචාරය</th>
            <th>ලිපිය යැවූ දිනය</th>
            <th>ලිපිය යැවූ ස්ථානය</th>
            <th>Letter Type</th>
          </tr>
        </thead>
        <tbody>
          {filteredLetters.length === 0 ? (
            <tr>
              <td colSpan="6">No letters found.</td>
            </tr>
          ) : (
            filteredLetters.map((letter) => (
              <tr key={letter.id}>
                <td>{letter.subject_no}</td>

                {/* letter_date */}
                <td>
                  <input
                    type="date"
                    value={letter.letter_date ? letter.letter_date.split("T")[0] : ""}
                    onChange={(e) =>
                      handleInputChange(letter.id, "letter_date", e.target.value)
                    }
                    className="row-input"
                  />
                </td>

                {/* details */}
                <td>
                  <select
                    value={letter.details || ""}
                    onChange={(e) =>
                      handleInputChange(letter.id, "details", e.target.value)
                    }
                    className="row-input"
                  >
                    <option value="">-- Select --</option>
                    <option value="Processing">Processing</option>
                    <option value="Invalid">Invalid</option>
                    <option value="Closed">Closed</option>
                    <option value="Attached to File">Attached to File</option>
                  </select>
                </td>

                {/* sent_date */}
                <td>
                  <input
                    type="date"
                    value={letter.sent_date ? letter.sent_date.split("T")[0] : ""}
                    onChange={(e) =>
                      handleInputChange(letter.id, "sent_date", e.target.value)
                    }
                    className="row-input"
                  />
                </td>

                {/* address */}
                <td>
                  <input
                    type="text"
                    value={letter.address || ""}
                    onChange={(e) =>
                      handleInputChange(letter.id, "address", e.target.value)
                    }
                    className="row-input"
                  />
                </td>

                <td>{letter.letter_type}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <button className="submit-btn" onClick={handleSubmitAll}>
        Submit All
      </button>
    </div>
  );
};

export default Show;
