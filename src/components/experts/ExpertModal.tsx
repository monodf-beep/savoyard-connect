import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Laptop, Scale, Palette, Euro, Languages, Check, Lock, Send, FileText } from 'lucide-react';
import { Expert, ExpertContactForm } from '@/types/experts';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ExpertModalProps {
  expert: Expert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const iconMap = {
  laptop: { icon: Laptop, color: 'text-blue-600 bg-blue-100' },
  scale: { icon: Scale, color: 'text-rose-700 bg-rose-100' },
  palette: { icon: Palette, color: 'text-violet-600 bg-violet-100' },
  euro: { icon: Euro, color: 'text-emerald-600 bg-emerald-100' },
  languages: { icon: Languages, color: 'text-orange-600 bg-orange-100' },
};

export const ExpertModal = ({ expert, open, onOpenChange }: ExpertModalProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [formData, setFormData] = useState<ExpertContactForm>({
    name: '',
    email: user?.email || '',
    association: '',
    needType: '',
    message: '',
    acceptContact: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Anti-spam

  if (!expert) return null;

  const initials = expert.name.split(' ').map(n => n[0]).join('');
  const IconConfig = iconMap[expert.iconType];
  const IconComponent = IconConfig.icon;
  const currentLang = i18n.language as 'fr' | 'it';
  const bio = expert.bio[currentLang] || expert.bio.fr;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check
    if (honeypot) return;

    if (!formData.acceptContact) {
      toast.error(t('experts.form.acceptRequired'));
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(t('experts.form.successMessage'));
    setIsSubmitting(false);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      name: '',
      email: user?.email || '',
      association: '',
      needType: '',
      message: '',
      acceptContact: false,
    });
  };

  const handleSignupRedirect = () => {
    // Store expert slug to return after signup
    localStorage.setItem('returnToExpert', expert.slug);
    navigate('/signup');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-2 border-[#1e3a8a]/20">
              <AvatarImage src={expert.avatarUrl} alt={expert.name} />
              <AvatarFallback className="bg-gradient-to-br from-[#1e3a8a] to-[#065f46] text-white font-bold text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                {expert.name}
              </DialogTitle>
              <p className="text-muted-foreground">{expert.role}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Bio */}
          <div>
            <p className="text-muted-foreground leading-relaxed">{bio}</p>
          </div>

          {/* Expertises */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${IconConfig.color}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              {t('experts.modal.expertises')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {expert.fullExpertises.map((expertise, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-[#065f46]" />
                  {expertise}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <h4 className="font-semibold text-foreground mb-3">{t('experts.modal.pricing')}</h4>
            {isLoggedIn ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('experts.modal.marketRate')}</span>
                  <span className="text-muted-foreground line-through">{expert.marketRate}€/h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[#065f46]">{t('experts.modal.memberRate')}</span>
                  <span className="font-bold text-[#065f46] text-lg">{expert.memberRate}€/h (-{expert.discount}%)</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{t('experts.modal.quotesAvailable')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Badge className="bg-[#065f46] text-white">-{expert.discount}%</Badge>
                  <span>{t('experts.modal.memberDiscountInfo')}</span>
                </div>
                <p className="text-sm text-muted-foreground italic">{t('experts.modal.pricingHidden')}</p>
              </div>
            )}
          </div>

          {/* Contact Section */}
          {isLoggedIn ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="font-semibold text-foreground">{t('experts.form.title')}</h4>
              
              {/* Honeypot - hidden from users */}
              <input 
                type="text" 
                name="website" 
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('experts.form.name')}</Label>
                  <Input 
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('experts.form.namePlaceholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('experts.form.email')}</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="association">{t('experts.form.association')}</Label>
                  <Input 
                    id="association"
                    value={formData.association}
                    onChange={(e) => setFormData({ ...formData, association: e.target.value })}
                    placeholder={t('experts.form.associationPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="needType">{t('experts.form.needType')}</Label>
                  <Select 
                    value={formData.needType} 
                    onValueChange={(value) => setFormData({ ...formData, needType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('experts.form.selectNeed')} />
                    </SelectTrigger>
                    <SelectContent>
                      {expert.fullExpertises.map((expertise, index) => (
                        <SelectItem key={index} value={expertise}>
                          {expertise}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t('experts.form.message')}</Label>
                <Textarea 
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t('experts.form.messagePlaceholder')}
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox 
                  id="acceptContact"
                  checked={formData.acceptContact}
                  onCheckedChange={(checked) => setFormData({ ...formData, acceptContact: checked as boolean })}
                />
                <Label htmlFor="acceptContact" className="text-sm text-muted-foreground cursor-pointer">
                  {t('experts.form.acceptContact')}
                </Label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  type="submit" 
                  className="flex-1 bg-[#dc2626] hover:bg-[#dc2626]/90 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">{t('experts.form.sending')}</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t('experts.form.submit')}
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex-1 border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a]/10"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {t('experts.form.requestQuote')}
                </Button>
              </div>
            </form>
          ) : (
            <div className="relative">
              {/* Blurred/locked contact form */}
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl">
                <Lock className="w-10 h-10 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground mb-4 px-4">
                  {t('experts.modal.loginRequired')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleSignupRedirect}
                    className="bg-[#dc2626] hover:bg-[#dc2626]/90 text-white"
                  >
                    {t('experts.modal.createAccount')}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/login')}
                  >
                    {t('experts.modal.alreadyMember')}
                  </Button>
                </div>
              </div>
              
              {/* Placeholder form (greyed out) */}
              <div className="space-y-4 opacity-30 pointer-events-none p-4 border border-border rounded-xl">
                <h4 className="font-semibold text-foreground">{t('experts.form.title')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder={t('experts.form.name')} disabled />
                  <Input placeholder={t('experts.form.email')} disabled />
                </div>
                <Textarea placeholder={t('experts.form.messagePlaceholder')} disabled rows={3} />
                <Button disabled className="w-full">{t('experts.form.submit')}</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
