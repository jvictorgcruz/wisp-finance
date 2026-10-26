import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Modal from './Modal';

vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('Modal Component', () => {
    const onClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders modal content and title when show is true', () => {
        render(
            <Modal show={true} onClose={onClose} title="Test Modal">
                <div>Modal Content</div>
            </Modal>
        );

        expect(screen.getByText('Test Modal')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('does not close when clicking the backdrop (outside the modal panel)', () => {
        render(
            <Modal show={true} onClose={onClose} title="Test Modal">
                <div>Modal Content</div>
            </Modal>
        );

        const backdrop = screen.getByTestId('modal-backdrop');
        fireEvent.pointerDown(backdrop);
        fireEvent.pointerUp(backdrop);
        fireEvent.click(backdrop);

        expect(onClose).not.toHaveBeenCalled();
    });

    it('closes immediately when clicking X button and isDirty is false', () => {
        render(
            <Modal show={true} onClose={onClose} title="Test Modal" isDirty={false}>
                <div>Modal Content</div>
            </Modal>
        );

        const closeBtn = screen.getByRole('button', { name: 'common.cancel' });
        fireEvent.click(closeBtn);

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('discard-confirmation')).not.toBeInTheDocument();
    });

    it('closes immediately when clicking a data-modal-close button and isDirty is false', () => {
        render(
            <Modal show={true} onClose={onClose} title="Test Modal" isDirty={false}>
                <button type="button" data-modal-close>
                    Cancel Form
                </button>
            </Modal>
        );

        fireEvent.click(screen.getByText('Cancel Form'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('shows discard confirmation when clicking X and isDirty is true', () => {
        render(
            <Modal show={true} onClose={onClose} title="Test Modal" isDirty={true}>
                <div>Modal Content</div>
            </Modal>
        );

        const closeBtn = screen.getByRole('button', { name: 'common.cancel' });
        fireEvent.click(closeBtn);

        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByTestId('discard-confirmation')).toBeInTheDocument();
        expect(screen.getByText('common.discard_changes_title')).toBeInTheDocument();
    });

    it('shows discard confirmation when clicking a data-modal-close button and isDirty is true', () => {
        render(
            <Modal show={true} onClose={onClose} title="Test Modal" isDirty={true}>
                <button type="button" data-modal-close>
                    Cancel Form
                </button>
            </Modal>
        );

        fireEvent.click(screen.getByText('Cancel Form'));

        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByTestId('discard-confirmation')).toBeInTheDocument();
    });

    it('keeps modal open and hides confirmation when clicking keep editing', () => {
        render(
            <Modal show={true} onClose={onClose} title="Test Modal" isDirty={true}>
                <div>Modal Content</div>
            </Modal>
        );

        const closeBtn = screen.getByRole('button', { name: 'common.cancel' });
        fireEvent.click(closeBtn);

        expect(screen.getByTestId('discard-confirmation')).toBeInTheDocument();

        fireEvent.click(screen.getByText('common.keep_editing'));

        expect(screen.queryByTestId('discard-confirmation')).not.toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when confirming discard', () => {
        render(
            <Modal show={true} onClose={onClose} title="Test Modal" isDirty={true}>
                <div>Modal Content</div>
            </Modal>
        );

        const closeBtn = screen.getByRole('button', { name: 'common.cancel' });
        fireEvent.click(closeBtn);

        fireEvent.click(screen.getByText('common.discard'));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('triggers discard confirmation on Escape when isDirty is true, and closes confirmation on second Escape', () => {
        render(
            <Modal show={true} onClose={onClose} title="Test Modal" isDirty={true}>
                <div>Modal Content</div>
            </Modal>
        );

        fireEvent.keyDown(window, { key: 'Escape' });

        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByTestId('discard-confirmation')).toBeInTheDocument();

        // Second Escape should dismiss the confirmation dialog and return to form
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(screen.queryByTestId('discard-confirmation')).not.toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();
    });
});
