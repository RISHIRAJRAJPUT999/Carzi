import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Mail, Lock, User, Phone, CreditCard, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CarOwnerSignup: React.FC = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        aadhaar: ''
    });
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { signup, sendOTP, verifyOTP } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Step 1: Collect details, create user, and then send OTP
        if (step === 1) {
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }
            // Make Aadhaar optional on the frontend
            if (formData.aadhaar && formData.aadhaar.length !== 12) {
                setError('Aadhaar number must be 12 digits');
                setLoading(false);
                return;
            }

            try {
                // 1. Create the user in the database (with verified: false)
                const signupResponse = await signup({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    aadhaar: formData.aadhaar,
                    type: 'car-owner'
                });

                if (!signupResponse.success) {
                    setError(signupResponse.message || 'Signup failed. This email or phone may already be in use.');
                    setLoading(false);
                    return;
                }

                // 2. If user creation is successful, then send the OTP
                const otpResponse = await sendOTP(formData.email);
                if (otpResponse.success) {
                    setStep(2); // Move to the OTP entry screen
                } else {
                    setError(otpResponse.message || 'User created, but failed to send OTP.');
                }
            } catch (err) {
                setError('An unexpected error occurred. Please try again.');
            } finally {
                setLoading(false);
            }
        }
        // Step 2: Verify the OTP and redirect to the login page
        else if (step === 2) {
            try {
                const verifyResponse = await verifyOTP(formData.email, otp);

                if (verifyResponse.success) {
                    // --- UPDATED LOGIC ---
                    // Redirect to the login page with a success message.
                    // The user can now log in with their newly verified account.
                    navigate('/login', { 
                        state: { message: 'Verification successful! Please log in.' } 
                    });
                } else {
                    setError(verifyResponse.message || 'Invalid OTP. Please try again.');
                }
            } catch (err) {
                setError('Verification failed. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const renderStep1 = () => (
        <div className="space-y-4">
            {/* Name Input */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500" placeholder="Enter your full name" />
                </div>
            </div>

            {/* Email Input */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500" placeholder="Enter your email" />
                </div>
            </div>

            {/* Phone Input */}
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500" placeholder="Enter your phone number" />
                </div>
            </div>

            {/* Aadhaar Input (Optional) */}
            <div>
                <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700">Aadhaar Number (Optional)</label>
                <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input id="aadhaar" name="aadhaar" type="text" pattern="[0-9]{12}" maxLength={12} value={formData.aadhaar} onChange={handleChange} className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500" placeholder="12-digit Aadhaar number" />
                </div>
            </div>

            {/* Password Input */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange} className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500" placeholder="Enter your password" />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirm Password Input */}
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange} className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500" placeholder="Confirm your password" />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400 hover:text-gray-600">
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="text-center space-y-4">
            <div className="bg-teal-50 p-6 rounded-lg">
                <CheckCircle className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Verification Code</h3>
                <p className="text-gray-600">We've sent a 6-digit code to <strong>{formData.email}</strong></p>
            </div>

            <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                <input id="otp" name="otp" type="text" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full text-center text-2xl font-mono py-3 px-4 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500" placeholder="Enter 6-digit code" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div>
                    <div className="flex justify-center">
                        <Car className="h-12 w-12 text-teal-600" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Become a Car Owner</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {step === 1 ? 'Join our platform and start earning' : 'One last step to secure your account'}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center space-x-2">
                        {[1, 2].map((stepNum) => (
                            <React.Fragment key={stepNum}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= stepNum ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    {stepNum}
                                </div>
                                {stepNum < 2 && (
                                    <div className={`w-8 h-1 ${step > stepNum ? 'bg-teal-600' : 'bg-gray-200'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}

                    <div>
                        <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Processing...' : step === 1 ? 'Create Account & Verify' : 'Complete Registration'}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CarOwnerSignup;