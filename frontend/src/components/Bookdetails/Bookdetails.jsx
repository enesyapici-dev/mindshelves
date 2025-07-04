import React, { useState, useEffect } from "react";
import "./Bookdetails.css";
import { IoIosArrowBack } from "react-icons/io";
import { FaStar, FaTrashCan, FaPlus } from "react-icons/fa6";
import { MdModeEdit } from "react-icons/md";
import Loading from "../Loading/Loading";

const Bookdetails = ({
  book,
  onBack,
  loading,
  handleAddToRead,
  handleDeleteRead,
  handleUpdateRead,
  handleAddToReadLater,
  handleDeleteReadLater,
  dbBooks,
}) => {
  const [userRating, setUserRating] = useState(0);
  const [showRatingWarning, setShowRatingWarning] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editDate, setEditDate] = useState("");

  useEffect(() => {
    if (book && book.userStats) {
      setUserRating(book.userStats.userRating || 0);
      setEditRating(book.userStats.userRating || 0);
      if (
        Array.isArray(book.userStats.readDate) &&
        book.userStats.readDate.length > 0
      ) {
        setEditDate(
          book.userStats.readDate[book.userStats.readDate.length - 1]
        );
      } else if (book.userStats.readDate) {
        setEditDate(book.userStats.readDate);
      } else {
        setEditDate("");
      }
    } else {
      setUserRating(0);
      setEditRating(0);
      setEditDate("");
    }
  }, [book]);

  if (loading) return <Loading />;
  if (!book) return null;

  const info = book.volumeInfo || book;
  const title = info.title || book.title || "";
  let authors = info.authors || book.author || "Unknown Author";
  if (Array.isArray(authors)) authors = authors.join(", ");
  const publishedDate = (info.publishedDate || book.published_date || "").slice(
    0,
    4
  );
  const cover =
    (info.imageLinks && info.imageLinks.thumbnail) ||
    book.cover_image_url ||
    "https://placehold.co/128x193?text=No+Cover";

  // dbBook her zaman en güncel state'i temsil eder
  const dbBook = dbBooks?.find(
    (b) =>
      b.google_books_id === book.id ||
      b.google_books_id === book.google_books_id ||
      b._id === book._id
  );
  const isRead = dbBook ? dbBook.isRead : book.isRead;
  const isReadLater = dbBook ? !dbBook.isRead : false;
  const userStats = dbBook ? dbBook.userStats || {} : book.userStats || {};

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes("-")) {
      const [year, month, day] = dateStr.split("-");
      return `${day}.${month}.${year}`;
    }
    return dateStr;
  };

  const StarRating = ({ value, onChange, max = 10 }) => (
    <div>
      {[...Array(max)].map((_, i) => (
        <FaStar
          key={i}
          size={24}
          color={i < value ? "#ffc107" : "#393E46"}
          style={{ cursor: "pointer" }}
          onClick={() => onChange(i + 1)}
        />
      ))}
    </div>
  );

  const readDates = Array.isArray(userStats.readDate)
    ? userStats.readDate
    : userStats.readDate
    ? [userStats.readDate]
    : [];

  const handleMarkAsRead = async () => {
    if (userRating === 0) {
      setShowRatingWarning(true);
      setTimeout(() => setShowRatingWarning(false), 2000);
      return;
    }
    if (dbBook && !dbBook.isRead) {
      const updatedBook = {
        ...dbBook,
        isRead: true,
        userStats: {
          ...dbBook.userStats,
          userRating: userRating,
          readDate: [new Date().toISOString().split("T")[0]],
        },
      };
      await handleUpdateRead(updatedBook);
    } else if (!dbBook) {
      await handleAddToRead(book, userRating);
    }
  };

  const handleAddToReadLaterClick = async () => {
    if (!dbBook) {
      await handleAddToReadLater(book);
    }
  };

  const handleRemoveFromReadLater = async () => {
    if (dbBook && !dbBook.isRead) {
      await handleDeleteReadLater(dbBook._id);
    }
  };

  return (
    <div className="book-details-cont">
      <button className="book-details-back-btn" onClick={onBack}>
        <IoIosArrowBack />
      </button>
      <div className="book-details-global">
        <a
          href={`https://www.google.com/search?q=${title}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img className="book-details-poster" src={cover} alt={title} />
        </a>
        <div className="book-head-details">
          <h2 className="book-details-title">{title}</h2>
          <h3 className="book-details-title">{authors}</h3>
          <p className="book-details-title">{publishedDate}</p>
        </div>
      </div>
      <div className="book-details-user">
        {editMode ? (
          <div className="book-details-user-cont">
            <div className="book-details-user-stats">
              <h2 className="user-stats-header">Edit Book</h2>
              <span className="user-stats-edit-headers">Edit Rating</span>
              <span className="user-stats-edit-stars">
                <StarRating
                  value={editRating}
                  onChange={setEditRating}
                  max={10}
                />
              </span>
              <span className="user-stats-edit-headers">Edit read date:</span>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="user-stats-edit-date-input"
                onMouseDown={(e) => e.target.showPicker()}
                onKeyDown={(e) => e.preventDefault()}
                style={{ caretColor: "transparent" }}
              />
            </div>
            <div className="book-buttons-cont user-stats-buttons">
              <button
                className="book-details-button stats-button"
                onClick={async () => {
                  if (dbBook) {
                    const updatedBook = {
                      ...dbBook,
                      userStats: {
                        ...dbBook.userStats,
                        userRating: editRating,
                        readDate: [editDate],
                      },
                    };
                    await handleUpdateRead(updatedBook);
                    setEditMode(false);
                  }
                }}
              >
                Save
              </button>
              <button
                className="book-details-button stats-button"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : isRead ? (
          showDeleteWarning ? (
            <div className="book-details-user-cont">
              <span className="delete-q">
                Do You Want to Remove {title} From Read Books?
              </span>
              <div className="book-buttons-cont">
                <button
                  className="book-details-button delete-no"
                  onClick={() => setShowDeleteWarning(false)}
                >
                  No
                </button>
                <button
                  className="book-details-button delete-yes"
                  onClick={async () => {
                    await handleDeleteRead(dbBook._id);
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          ) : (
            <div className="book-details-user-cont">
              <div className="book-details-user-stats">
                <h2 className="user-stats-header">User Stats</h2>
                <span className="book-card-user-rating">
                  Rating: <span>★</span>
                  {userStats.userRating}/10
                </span>
                <span className="book-card-read-date">
                  {Array.isArray(userStats.readDate)
                    ? userStats.readDate.map((date, i) => (
                        <span key={i}>
                          {i + 1} • {formatDate(date)}
                        </span>
                      ))
                    : userStats.readDate && (
                        <span>1 • {formatDate(userStats.readDate)}</span>
                      )}
                </span>
              </div>
              <div className="book-buttons-cont user-stats-buttons">
                <button
                  className="book-details-button stats-button"
                  onClick={() => setEditMode(true)}
                >
                  <MdModeEdit />
                </button>
                <button
                  className="book-details-button stats-button"
                  onClick={() => setShowDeleteWarning(true)}
                >
                  <FaTrashCan />
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="book-details-user-cont">
            <StarRating value={userRating} onChange={setUserRating} max={10} />
            <div className="book-buttons-cont">
              <button
                className="book-details-button"
                onClick={handleMarkAsRead}
              >
                Mark as Read
              </button>
              {isReadLater ? (
                <button
                  className="book-details-button remove-button"
                  onClick={handleRemoveFromReadLater}
                >
                  Remove from Read Later
                </button>
              ) : (
                <button
                  className="book-details-button add-readlater-button"
                  onClick={handleAddToReadLaterClick}
                >
                  Add to Read Later
                </button>
              )}
            </div>
            {showRatingWarning && (
              <span className="warning-toast">Please rate the book!</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookdetails;
