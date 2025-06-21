// Script to insert sample case studies
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const sampleCaseStudies = [
  {
    title: "AI-Powered Recommendation Engine",
    slug: "ai-recommendation-engine",
    description: "Designed and implemented a machine learning recommendation system that increased user engagement by 40% and drove $2M in additional revenue.",
    content: JSON.stringify({
      "time": 1640995200000,
      "blocks": [
        {
          "type": "header",
          "data": {
            "text": "Challenge",
            "level": 2
          }
        },
        {
          "type": "paragraph",
          "data": {
            "text": "The e-commerce platform was struggling with low user engagement and poor product discovery. Users were abandoning their sessions without finding relevant products, leading to a 60% bounce rate on product pages."
          }
        },
        {
          "type": "header",
          "data": {
            "text": "Solution Approach",
            "level": 2
          }
        },
        {
          "type": "list",
          "data": {
            "style": "unordered",
            "items": [
              "Analyzed user behavior data from 500K+ sessions",
              "Implemented collaborative filtering algorithms",
              "Built real-time recommendation API using Python and Redis",
              "A/B tested different recommendation strategies"
            ]
          }
        },
        {
          "type": "header",
          "data": {
            "text": "Technical Implementation",
            "level": 2
          }
        },
        {
          "type": "paragraph",
          "data": {
            "text": "The recommendation engine was built using a hybrid approach combining collaborative filtering and content-based filtering. We utilized TensorFlow for model training and deployed the system on AWS with auto-scaling capabilities."
          }
        },
        {
          "type": "code",
          "data": {
            "code": "# Sample recommendation algorithm\ndef generate_recommendations(user_id, num_recommendations=10):\n    user_vector = get_user_embedding(user_id)\n    product_similarities = compute_cosine_similarity(user_vector, product_vectors)\n    return get_top_products(product_similarities, num_recommendations)"
          }
        },
        {
          "type": "header",
          "data": {
            "text": "Results",
            "level": 2
          }
        },
        {
          "type": "list",
          "data": {
            "style": "unordered",
            "items": [
              "40% increase in user engagement",
              "$2M additional revenue in first quarter",
              "25% reduction in bounce rate",
              "3x improvement in click-through rates"
            ]
          }
        }
      ],
      "version": "2.23.2"
    }),
    tags: ["Machine Learning", "Product Management", "Data Science", "Python"],
    isPublished: true,
    isFeatured: true
  },
  {
    title: "Customer Churn Prediction Model",
    slug: "customer-churn-prediction",
    description: "Developed a predictive analytics solution that reduced customer churn by 30% through early intervention strategies and personalized retention campaigns.",
    content: JSON.stringify({
      "time": 1640995200000,
      "blocks": [
        {
          "type": "header",
          "data": {
            "text": "Business Problem",
            "level": 2
          }
        },
        {
          "type": "paragraph",
          "data": {
            "text": "The SaaS company was experiencing a 15% monthly churn rate, significantly impacting revenue growth. Traditional reactive approaches to customer retention were proving insufficient."
          }
        },
        {
          "type": "quote",
          "data": {
            "text": "We needed to shift from reactive to proactive customer success strategies.",
            "caption": "Head of Customer Success"
          }
        },
        {
          "type": "header",
          "data": {
            "text": "Data Analysis & Insights",
            "level": 2
          }
        },
        {
          "type": "paragraph",
          "data": {
            "text": "I analyzed 18 months of customer data including usage patterns, support tickets, billing history, and engagement metrics to identify key churn indicators."
          }
        },
        {
          "type": "list",
          "data": {
            "style": "ordered",
            "items": [
              "Collected data from 50,000+ customer accounts",
              "Identified 25+ potential churn indicators",
              "Performed feature engineering and selection",
              "Built and validated predictive models"
            ]
          }
        },
        {
          "type": "header",
          "data": {
            "text": "Model Performance",
            "level": 2
          }
        },
        {
          "type": "paragraph",
          "data": {
            "text": "The final ensemble model achieved 87% accuracy in predicting churn 30 days in advance, giving the customer success team valuable time to intervene."
          }
        },
        {
          "type": "delimiter",
          "data": {}
        },
        {
          "type": "header",
          "data": {
            "text": "Impact",
            "level": 2
          }
        },
        {
          "type": "list",
          "data": {
            "style": "unordered",
            "items": [
              "30% reduction in customer churn",
              "$500K annual revenue saved",
              "Improved customer satisfaction scores",
              "Enabled proactive customer success initiatives"
            ]
          }
        }
      ],
      "version": "2.23.2"
    }),
    tags: ["Predictive Analytics", "Customer Success", "Machine Learning", "SQL"],
    isPublished: true,
    isFeatured: false
  },
  {
    title: "Mobile App User Experience Optimization",
    slug: "mobile-ux-optimization",
    description: "Led a comprehensive UX redesign that improved app ratings from 3.2 to 4.7 stars and increased daily active users by 65% through data-driven design decisions.",
    content: JSON.stringify({
      "time": 1640995200000,
      "blocks": [
        {
          "type": "header",
          "data": {
            "text": "The Challenge",
            "level": 2
          }
        },
        {
          "type": "paragraph",
          "data": {
            "text": "Our mobile app had poor user ratings (3.2/5) and low engagement metrics. User feedback indicated confusion with navigation and frustration with core features."
          }
        },
        {
          "type": "header",
          "data": {
            "text": "Research & Discovery",
            "level": 2
          }
        },
        {
          "type": "paragraph",
          "data": {
            "text": "I conducted extensive user research to understand pain points and opportunities for improvement."
          }
        },
        {
          "type": "list",
          "data": {
            "style": "unordered",
            "items": [
              "User interviews with 50+ customers",
              "Heat map analysis of user interactions",
              "Competitor analysis and benchmarking",
              "A/B testing of critical user flows"
            ]
          }
        },
        {
          "type": "header",
          "data": {
            "text": "Design Solutions",
            "level": 2
          }
        },
        {
          "type": "paragraph",
          "data": {
            "text": "Based on research insights, I redesigned the core user experience with focus on simplicity and intuitive navigation."
          }
        },
        {
          "type": "quote",
          "data": {
            "text": "The new design feels so much more intuitive. I can actually find what I'm looking for now!",
            "caption": "Beta User Feedback"
          }
        },
        {
          "type": "header",
          "data": {
            "text": "Implementation & Results",
            "level": 2
          }
        },
        {
          "type": "paragraph",
          "data": {
            "text": "We rolled out the redesign in phases, carefully monitoring metrics and gathering user feedback at each stage."
          }
        },
        {
          "type": "list",
          "data": {
            "style": "unordered",
            "items": [
              "App store rating improved from 3.2 to 4.7 stars",
              "65% increase in daily active users",
              "40% reduction in support tickets",
              "35% improvement in task completion rates"
            ]
          }
        }
      ],
      "version": "2.23.2"
    }),
    tags: ["UX Design", "Product Management", "Mobile Development", "User Research"],
    isPublished: true,
    isFeatured: true
  }
];

async function insertCaseStudies() {
  const client = await pool.connect();
  
  try {
    console.log('Inserting sample case studies...');
    
    for (const caseStudy of sampleCaseStudies) {
      await client.query(`
        INSERT INTO case_studies (title, slug, description, content, tags, is_published, is_featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          content = EXCLUDED.content,
          tags = EXCLUDED.tags,
          is_published = EXCLUDED.is_published,
          is_featured = EXCLUDED.is_featured,
          updated_at = NOW()
      `, [
        caseStudy.title,
        caseStudy.slug,
        caseStudy.description,
        caseStudy.content,
        caseStudy.tags,
        caseStudy.isPublished,
        caseStudy.isFeatured
      ]);
      
      console.log(`✓ Inserted: ${caseStudy.title}`);
    }
    
    console.log('✅ All case studies inserted successfully!');
    
  } catch (error) {
    console.error('Error inserting case studies:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

insertCaseStudies();