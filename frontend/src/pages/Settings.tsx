
import { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';

const Settings = () => {
  const { user, setUser } = useUser();
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewPictureUrl, setPreviewPictureUrl] = useState<string | null>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [currency, setCurrency] = useState('USD');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const getPasswordStrength = (password: string) => {
    if (password.length < 4) return { strength: 0, label: 'Weak', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 50, label: 'Medium', color: 'bg-accent-yellow' };
    return { strength: 100, label: 'Strong', color: 'bg-primary-green' };
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePictureFile(e.target.files[0]);
      setPreviewPictureUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePictureFile) return;
    setIsUploading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', profilePictureFile);

    try {
      const res = await fetch('http://localhost:8060/users/me/profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        setFeedback({ type: 'error', message: errorData.detail || 'Failed to upload profile picture.' });
        return;
      }
      const updatedUser = await res.json();
      setUser(updatedUser);
      setFeedback({ type: 'success', message: 'Profile picture updated successfully!' });
      setProfilePictureFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: unknown) {
      setFeedback({ type: 'error', message: 'Failed to upload profile picture.' });
    } finally {
      setIsUploading(false);
      setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
    }
  };

  const handlePersonalSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setFeedback({ type: 'error', message: 'Authentication token not found.' });
        return;
      }

      // 1. Upload profile picture if selected
      let updatedUser = user;
      if (profilePictureFile) {
        setPreviewPictureUrl(null);
        const formData = new FormData();
        formData.append('file', profilePictureFile);
        const res = await fetch('http://localhost:8060/users/me/profile-picture', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
        if (!res.ok) {
          const errorData = await res.json();
          setFeedback({ type: 'error', message: errorData.detail || 'Failed to upload profile picture.' });
          return;
        }
        updatedUser = await res.json();
        setUser(updatedUser);
        setProfilePictureFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }

      // 2. Update personal info
      const res = await fetch('http://localhost:8060/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(personalInfo),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to update personal information.');
      }

      updatedUser = await res.json();
      setUser(updatedUser);
      setFeedback({ type: 'success', message: 'Personal information updated successfully!' });
    } catch (error: unknown) {
      console.error('Error updating personal info:', error);
      setFeedback({ type: 'error', message: (error as Error).message || 'Failed to update personal information.' });
    } finally {
      setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
    }
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFeedback({ type: 'error', message: 'New passwords do not match!' });
      return;
    }
    setFeedback({ type: 'success', message: 'Password changed successfully!' });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
  };

  const handleCurrencySave = () => {
    setFeedback({ type: 'success', message: 'Currency preference saved!' });
    setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-green to-accent-yellow p-6 rounded-lg text-white">
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="mt-1 opacity-90">Manage your account and preferences</p>
      </div>

      {/* Feedback Alert */}
      {feedback.message && (
        <Alert className={feedback.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={feedback.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {feedback.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Settings</TabsTrigger>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
          <TabsTrigger value="currency">Currency Settings</TabsTrigger>
        </TabsList>

        {/* Personal Settings */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalInfo.email}
                  readOnly
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500 mt-1">Contact support to change your email address</p>
              </div>
              <div>
                <Label>Profile Picture</Label>
                <div className="flex items-center space-x-4 mt-2">
                  {/* Show preview if a new image is selected, else show current profile picture */}
                  {previewPictureUrl ? (
                    <img src={previewPictureUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-primary-green" />
                  ) : user?.profile_picture_url ? (
                    <img src={user.profile_picture_url} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 text-2xl font-semibold">
                        {personalInfo.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleProfilePictureChange}
                    className="hidden"
                    id="profile-picture-upload"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>

              </div>
              <Button onClick={handlePersonalSave} className="bg-black hover:bg-yellow-500" disabled={isUploading}>
                {isUploading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Change Password</h3>
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                  {passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Password Strength</span>
                        <span className={`font-medium ${passwordStrength.strength === 100 ? 'text-green-600' :
                          passwordStrength.strength === 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <Progress value={passwordStrength.strength} className="h-2" />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
                <Button onClick={handlePasswordChange} className="bg-black hover:bg-yellow-500">
                  Change Password
                </Button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                <p className="text-gray-600 mb-4">Add an extra layer of security to your account</p>
                <Button variant="outline">Set up 2FA</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currency Settings */}
        <TabsContent value="currency">
          <Card>
            <CardHeader>
              <CardTitle>Currency Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currency">Default Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    <SelectItem value="KRW">KRW - Korean Won</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCurrencySave} className="bg-black hover:bg-yellow-500">
                Save Currency
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
