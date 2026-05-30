import { createClient } from './supabase/server';
import { refreshStravaToken } from './strava';

/**
 * Get valid Strava access token, refresh nếu cần
 * @param userId - User ID để lấy token từ database
 * @returns Access token hoặc null nếu không thể refresh
 */
export const getValidStravaToken = async (userId: string): Promise<string | null> => {
  try {
    const supabase = await createClient();

    // Lấy profile của user
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('strava_access_token, strava_refresh_token, strava_token_expires_at')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (!profile.strava_access_token) {
      console.log('No Strava token found');
      return null;
    }

    // Kiểm tra token có hết hạn chưa
    const expiresAt = profile.strava_token_expires_at ? new Date(profile.strava_token_expires_at) : null;
    const now = new Date();

    // Nếu token còn hạn và còn ít nhất 5 phút thì dùng cái cũ
    if (expiresAt && expiresAt.getTime() > now.getTime() + 5 * 60 * 1000) {
      return profile.strava_access_token;
    }

    // Token hết hạn hoặc sắp hết - refresh
    console.log('Token expired or expiring soon, refreshing...');

    if (!profile.strava_refresh_token) {
      console.error('No refresh token available');
      return null;
    }

    const newTokenData = await refreshStravaToken(profile.strava_refresh_token);
    if (!newTokenData) {
      console.error('Failed to refresh token');
      return null;
    }

    // Lưu token mới vào database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        strava_access_token: newTokenData.access_token,
        strava_refresh_token: newTokenData.refresh_token,
        strava_token_expires_at: newTokenData.expires_at,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating token in database:', updateError);
      // Vẫn return token mới dù lưu database thất bại
    } else {
      console.log('Token refreshed and saved successfully');
    }

    return newTokenData.access_token;
  } catch (error) {
    console.error('Error in getValidStravaToken:', error);
    return null;
  }
};
