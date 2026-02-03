import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Upload, Loader2, AlertTriangle, CheckCircle, XCircle,
    Leaf, Bug, Shield, Pill, RefreshCw, Info, Image as ImageIcon,
    ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useLanguage } from '../contexts/LanguageContext';
import { analyzeCropDisease, DiseaseDetectionResult } from '../lib/api';

export function DiseaseDetection() {
    const { language, t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<DiseaseDetectionResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedSection, setExpandedSection] = useState<string | null>('symptoms');

    // Convert file to base64
    const fileToBase64 = useCallback((file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }, []);

    // Handle file selection
    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Image too large. Maximum size is 10MB');
            return;
        }

        try {
            const base64 = await fileToBase64(file);
            setSelectedImage(base64);
            setResult(null);
            setError(null);
        } catch (err) {
            setError('Failed to load image');
        }
    }, [fileToBase64]);

    // Trigger file input
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Trigger camera input
    const handleCameraClick = () => {
        cameraInputRef.current?.click();
    };

    // Analyze the image
    const handleAnalyze = useCallback(async () => {
        if (!selectedImage) return;

        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const analysisResult = await analyzeCropDisease(selectedImage, language);
            setResult(analysisResult);
            setExpandedSection('symptoms');
        } catch (err: any) {
            console.error('Analysis failed:', err);
            setError(err.message || 'Failed to analyze image. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    }, [selectedImage, language]);

    // Reset everything
    const handleReset = () => {
        setSelectedImage(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    // Toggle section
    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    // Get confidence color
    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'HIGH': return 'bg-green-500';
            case 'MEDIUM': return 'bg-amber-500';
            case 'LOW': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    // Get confidence badge variant
    const getConfidenceBadge = (confidence: string) => {
        switch (confidence) {
            case 'HIGH': return 'success';
            case 'MEDIUM': return 'warning';
            case 'LOW': return 'danger';
            default: return 'default';
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 mb-4 shadow-lg">
                        <Bug className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                        Crop Disease Detection
                    </h1>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Upload a photo of your crop or leaf, and our AI will analyze it for potential diseases
                    </p>
                </motion.div>

                {/* Upload Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="mb-6 overflow-hidden border-0 shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Camera className="w-5 h-5" />
                                Upload Crop/Leaf Image
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Hidden Inputs */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {/* Image Preview or Upload Buttons */}
                            {selectedImage ? (
                                <div className="space-y-4">
                                    <div className="relative rounded-xl overflow-hidden bg-slate-100 max-h-80 flex items-center justify-center">
                                        <img
                                            src={selectedImage}
                                            alt="Selected crop"
                                            className="max-h-80 object-contain"
                                        />
                                        <button
                                            onClick={handleReset}
                                            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                                        >
                                            <XCircle className="w-5 h-5 text-red-500" />
                                        </button>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={handleAnalyze}
                                            disabled={isAnalyzing}
                                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3"
                                        >
                                            {isAnalyzing ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Analyzing...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5 mr-2" />
                                                    Analyze Image
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={handleReset}
                                            variant="secondary"
                                            className="px-6"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Camera Button */}
                                    <button
                                        onClick={handleCameraClick}
                                        className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                                    >
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                                            <Camera className="w-8 h-8 text-white" />
                                        </div>
                                        <span className="text-lg font-semibold text-slate-700">Take Photo</span>
                                        <span className="text-sm text-slate-500">Use your camera</span>
                                    </button>

                                    {/* Upload Button */}
                                    <button
                                        onClick={handleUploadClick}
                                        className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all group"
                                    >
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                                            <Upload className="w-8 h-8 text-white" />
                                        </div>
                                        <span className="text-lg font-semibold text-slate-700">Upload Image</span>
                                        <span className="text-sm text-slate-500">From your device</span>
                                    </button>
                                </div>
                            )}

                            {/* Tips */}
                            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-800">
                                        <p className="font-medium mb-1">For best results:</p>
                                        <ul className="list-disc list-inside space-y-1 text-amber-700">
                                            <li>Take a clear, close-up photo of the affected area</li>
                                            <li>Ensure good lighting (natural daylight preferred)</li>
                                            <li>Include both healthy and affected parts if possible</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                        >
                            <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                            <p className="text-red-700">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading State */}
                <AnimatePresence>
                    {isAnalyzing && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <Card className="mb-6 border-0 shadow-xl">
                                <CardContent className="py-12 text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-4">
                                        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-800 mb-2">
                                        Analyzing Your Crop...
                                    </h3>
                                    <p className="text-slate-500">
                                        Our AI is examining the image for signs of disease
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Section */}
                <AnimatePresence>
                    {result && !isAnalyzing && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Main Result Card */}
                            <Card className={`mb-6 border-0 shadow-xl overflow-hidden ${result.isHealthy
                                ? 'bg-gradient-to-br from-green-50 to-emerald-50'
                                : 'bg-gradient-to-br from-amber-50 to-orange-50'
                                }`}>
                                <CardContent className="p-6">
                                    {/* Disease/Health Status */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${result.isHealthy
                                            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                            : 'bg-gradient-to-br from-amber-500 to-orange-600'
                                            }`}>
                                            {result.isHealthy ? (
                                                <CheckCircle className="w-8 h-8 text-white" />
                                            ) : (
                                                <Bug className="w-8 h-8 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-2xl font-bold text-slate-800">
                                                    {result.diseaseName}
                                                </h2>
                                                <Badge
                                                    variant={getConfidenceBadge(result.confidence) as any}
                                                    size="lg"
                                                >
                                                    {result.confidence} Confidence
                                                </Badge>
                                            </div>
                                            {result.additionalNotes && (
                                                <p className="text-slate-600">{result.additionalNotes}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Confidence Indicator */}
                                    <div className="mb-6">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-slate-600">Confidence Level</span>
                                            <span className="font-medium text-slate-800">{result.confidence}</span>
                                        </div>
                                        <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full rounded-full transition-all ${getConfidenceColor(result.confidence)}`}
                                                style={{
                                                    width: result.confidence === 'HIGH' ? '90%' :
                                                        result.confidence === 'MEDIUM' ? '60%' : '30%'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Expandable Sections */}
                                    <div className="space-y-3">
                                        {/* Symptoms */}
                                        {result.symptoms.length > 0 && (
                                            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                                                <button
                                                    onClick={() => toggleSection('symptoms')}
                                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                                            <AlertTriangle className="w-5 h-5 text-red-600" />
                                                        </div>
                                                        <span className="font-semibold text-slate-800">Observed Symptoms</span>
                                                    </div>
                                                    {expandedSection === 'symptoms' ? (
                                                        <ChevronUp className="w-5 h-5 text-slate-400" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                                    )}
                                                </button>
                                                <AnimatePresence>
                                                    {expandedSection === 'symptoms' && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-4 pb-4">
                                                                <ul className="space-y-2">
                                                                    {result.symptoms.map((symptom, index) => (
                                                                        <li key={index} className="flex items-start gap-2 text-slate-600">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                                                                            {symptom}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        {/* Treatment */}
                                        {result.treatment.length > 0 && (
                                            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                                                <button
                                                    onClick={() => toggleSection('treatment')}
                                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                            <Pill className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <span className="font-semibold text-slate-800">Suggested Treatment</span>
                                                    </div>
                                                    {expandedSection === 'treatment' ? (
                                                        <ChevronUp className="w-5 h-5 text-slate-400" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                                    )}
                                                </button>
                                                <AnimatePresence>
                                                    {expandedSection === 'treatment' && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-4 pb-4">
                                                                <ol className="space-y-2">
                                                                    {result.treatment.map((step, index) => (
                                                                        <li key={index} className="flex items-start gap-3 text-slate-600">
                                                                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                                                                                {index + 1}
                                                                            </span>
                                                                            {step}
                                                                        </li>
                                                                    ))}
                                                                </ol>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        {/* Prevention */}
                                        {result.prevention.length > 0 && (
                                            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                                                <button
                                                    onClick={() => toggleSection('prevention')}
                                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                                            <Shield className="w-5 h-5 text-green-600" />
                                                        </div>
                                                        <span className="font-semibold text-slate-800">Prevention Tips</span>
                                                    </div>
                                                    {expandedSection === 'prevention' ? (
                                                        <ChevronUp className="w-5 h-5 text-slate-400" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                                    )}
                                                </button>
                                                <AnimatePresence>
                                                    {expandedSection === 'prevention' && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-4 pb-4">
                                                                <ul className="space-y-2">
                                                                    {result.prevention.map((tip, index) => (
                                                                        <li key={index} className="flex items-start gap-2 text-slate-600">
                                                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                                                                            {tip}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Low Confidence Warning */}
                            {result.confidence === 'LOW' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3"
                                >
                                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-amber-800">Low Confidence Analysis</p>
                                        <p className="text-sm text-amber-700 mt-1">
                                            The analysis has low confidence. We recommend consulting a local agricultural
                                            expert or extension officer for accurate diagnosis.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Disclaimer */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="p-4 bg-slate-100 rounded-xl border border-slate-200"
                            >
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-slate-600">
                                        <p className="font-medium mb-1">⚠️ Important Disclaimer</p>
                                        <p>
                                            This is an <strong>AI-assisted prediction</strong>, not a medical or scientific diagnosis.
                                            Results may vary based on image quality and lighting conditions. For critical decisions,
                                            always consult a qualified agricultural expert or plant pathologist.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}
