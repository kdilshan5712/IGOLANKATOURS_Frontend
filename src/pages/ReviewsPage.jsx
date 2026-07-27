import { motion } from "framer-motion";
import ReviewsList from "../components/ReviewsList";
import ReviewForm from "../components/ReviewForm";
import SEO from "../components/SEO";
import "./ReviewsPage.css";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const ReviewsPage = () => {
  return (
    <main className="reviews-page">
      <SEO 
        title="Traveler Reviews & Testimonials – I GO LANKA TOURS"
        description="Read authentic traveler reviews and stories about I GO LANKA TOURS. Explore honest feedback on Sri Lanka tour packages, guides, drivers, and custom travel experiences."
        keywords="sri lanka tour reviews, travel testimonials sri lanka, igolanka tours feedback, authentic sri lanka travel reviews"
        canonicalUrl="https://www.igolankatours.com/reviews"
      />

      {/* Ambient Effects */}
      <div className="reviews-ambient-glow-1"></div>
      <div className="reviews-ambient-glow-2"></div>

      <motion.div 
        className="reviews-page-container"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp}>
          <ReviewsList />
        </motion.div>
        
        <motion.div variants={fadeUp}>
          <ReviewForm />
        </motion.div>
      </motion.div>
    </main>
  );
};

export default ReviewsPage;
