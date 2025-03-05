import mongoose from 'mongoose';

const siteConfigSchema = new mongoose.Schema({
    favicon: String,
    logo: String,
    title: String,
    description: String,
    banners: [String], // Array of banner URLs
    contact: {
        phone: String,
        email: String,
        address: String
    }
}, { timestamps: true });

const SiteConfig = mongoose.model('SiteConfig', siteConfigSchema);

export default SiteConfig;
