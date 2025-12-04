"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = void 0;
const supabase_1 = require("../config/supabase");
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // You can fetch additional profile data from a 'profiles' table if you have one
        // const { data: profile, error } = await supabase
        //   .from('profiles')
        //   .select('*')
        //   .eq('id', user.id)
        //   .single();
        // For now, return the auth user object
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const updates = req.body;
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Example: Update user metadata in Supabase Auth
        const { data, error } = yield supabase_1.supabase.auth.updateUser({
            data: updates
        });
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.status(200).json({ message: 'Profile updated successfully', user: data.user });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
exports.updateProfile = updateProfile;
