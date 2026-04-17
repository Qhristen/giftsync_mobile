import { Contact } from '@/types';
import React, { useState } from 'react';
import ContactDetails from '../contacts/ContactDetails';
import ContactForm from '../contacts/ContactForm';
import OccasionForm from '../occasions/OccasionForm';

type FlowStep = 'create-contact' | 'contact-details' | 'create-occasion';

interface UnifiedCreationFlowProps {
    onSuccess?: () => void;
    onCompleted?: () => void;
}

const UnifiedCreationFlow: React.FC<UnifiedCreationFlowProps> = ({ onSuccess, onCompleted }) => {
    const [step, setStep] = useState<FlowStep>('create-contact');
    const [createdContact, setCreatedContact] = useState<Contact | null>(null);

    const handleContactCreated = (id: string, contact?: Contact) => {
        if (contact) {
            setCreatedContact(contact);
            setStep('contact-details');
        }
    };

    const handleAddOccasion = () => {
        setStep('create-occasion');
    };

    if (step === 'create-contact') {
        return (
            <ContactForm
                onSuccess={handleContactCreated}
            />
        );
    }

    if (step === 'contact-details' && createdContact) {
        return (
            <ContactDetails
                contact={createdContact}
                onAddOccasion={handleAddOccasion}
            />
        );
    }

    if (step === 'create-occasion' && createdContact) {
        return (
            <OccasionForm
                fixedContactId={createdContact.id}
                fixedContactName={createdContact.name}
                onSuccess={onSuccess}
                onCompleted={onCompleted}
                onBack={() => setStep('contact-details')}
            />
        );
    }

    return null;
};

export default UnifiedCreationFlow;
