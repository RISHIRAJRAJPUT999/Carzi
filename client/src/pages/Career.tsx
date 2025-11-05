import React from 'react';
import { Briefcase, Users, Lightbulb, Award } from 'lucide-react';

const Career: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Join Our Team at Carzi</h1>

        <section className="mb-10 text-center">
          <p className="text-lg text-gray-700 leading-relaxed">
            At Carzi, we're revolutionizing the way people rent cars. We're a fast-growing, innovative platform connecting car owners with renters, making car sharing easy, accessible, and sustainable. If you're passionate about technology, mobility, and making a real impact, we'd love to hear from you.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Why Work With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <Briefcase className="h-8 w-8 text-teal-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Impactful Work</h3>
                <p className="text-gray-700">Contribute to a platform that's changing urban mobility and empowering car owners.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Users className="h-8 w-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Collaborative Culture</h3>
                <p className="text-gray-700">Work alongside talented and passionate individuals in a supportive and inclusive environment.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Lightbulb className="h-8 w-8 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Innovation & Growth</h3>
                <p className="text-gray-700">Be part of a company that values new ideas and offers ample opportunities for personal and professional development.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Award className="h-8 w-8 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Competitive Benefits</h3>
                <p className="text-gray-700">Enjoy a comprehensive benefits package, flexible working arrangements, and a healthy work-life balance.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Current Openings</h2>
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Frontend Developer (React)</h3>
              <p className="text-gray-700 mb-3">We're looking for a skilled React developer to build responsive and intuitive user interfaces for our web platform.</p>
              <ul className="list-disc list-inside text-gray-600 text-sm mb-3">
                <li>Experience with TypeScript, Tailwind CSS.</li>
                <li>Strong understanding of state management (Context API/Redux).</li>
                <li>Portfolio of previous React projects.</li>
              </ul>
              <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">Apply Now</button>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Backend Engineer (Node.js)</h3>
              <p className="text-gray-700 mb-3">Join our backend team to design, develop, and maintain scalable and robust APIs using Node.js and MongoDB.</p>
              <ul className="list-disc list-inside text-gray-600 text-sm mb-3">
                <li>Proficiency in Node.js, Express.js, MongoDB.</li>
                <li>Experience with RESTful API design and implementation.</li>
                <li>Knowledge of authentication and authorization best practices.</li>
              </ul>
              <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">Apply Now</button>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Product Manager</h3>
              <p className="text-gray-700 mb-3">Lead the product lifecycle from conception to launch, working closely with engineering, design, and marketing teams.</p>
              <ul className="list-disc list-inside text-gray-600 text-sm mb-3">
                <li>Proven experience in product management, preferably in a tech or mobility startup.</li>
                <li>Strong analytical and communication skills.</li>
                <li>Ability to define product vision and strategy.</li>
              </ul>
              <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">Apply Now</button>
            </div>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Don't see a role for you?</h2>
          <p className="text-lg text-gray-700 mb-4">
            We're always looking for talented individuals to join our growing team. Send us your resume and a cover letter explaining why you'd be a great fit for Carzi.
          </p>
          <a href="mailto:careers@carzi.com" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium">
            Send Your Resume
          </a>
        </section>
      </div>
    </div>
  );
};

export default Career;
