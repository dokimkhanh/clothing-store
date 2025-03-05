import SiteConfig from '../models/siteConfigModel.js';

export const siteConfigController = async (req, res) => {
    try {
        const { favicon, logo, title, description, banners, contact } = req.body;
        const siteConfig = await SiteConfig.findOneAndUpdate({}, {
            favicon,
            logo,
            title,
            description,
            banners,
            contact
        }, { new: true, upsert: true });

        res.status(200).json({ message: 'Site config updated successfully', data: siteConfig });
    } catch (error) {
        res.status(500).json({ message: 'Error updating site config', error });
    }
};
