const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    /* ===== CONTACT ===== */
    contactTitle: String,
    contactDescription: String,
    contactImage: String,

    address: String,
    hotline: String,
    email: String,
    openingHours: String,

    /* ===== ABOUT ===== */
    aboutTitle: String,
    aboutSubtitle: String,
    aboutBannerImage: String,
    aboutHeading: String,
    aboutContent: String,
    aboutImage: String,

    /* ===== PAGES ===== */
    pagesTitle: String,
    pagesSubtitle: String,
    pagesBannerImage: String,
    pagesHeading: String,
    pagesContent: String,
    pagesImage: String
}, { timestamps: true });


// 👇 CHỐT DÒNG QUAN TRỌNG
module.exports = mongoose.models.Setting
    || mongoose.model('Setting', settingSchema);
