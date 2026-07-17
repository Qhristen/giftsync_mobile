import { Contact } from '@/types';
import React, { useState } from 'react';
import ContactDetails from '../contacts/ContactDetails';
import ContactForm from '../contacts/ContactForm';
import EventForm from '../event/EventForm';

type FlowStep = 'create-contact' | 'contact-details' | 'create-event';

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

    const handleAddEvent = () => {
        setStep('create-event');
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
                onAddEvent={handleAddEvent}
            />
        );
    }

    if (step === 'create-event' && createdContact) {
        return (
            <EventForm
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
