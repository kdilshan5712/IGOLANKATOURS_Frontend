import ReviewsList from "../components/ReviewsList";
import ReviewForm from "../components/ReviewForm";
import "./ReviewsPage.css";

const ReviewsPage = () => {
  return (
    <main className="reviews-page">
      <div className="reviews-page-container">
        <ReviewsList />
        <ReviewForm />
      </div>
    </main>
  );
};

export default ReviewsPage;
