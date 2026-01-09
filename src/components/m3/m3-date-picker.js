import { LitElement, html, css } from 'lit';
import './m3-icon.js';
import './m3-ripple.js';
import './m3-text-field.js';

export class M3DatePicker extends LitElement {
    static properties = {
        label: { type: String },
        value: { type: String }, // ISO Date string YYYY-MM-DD
        disabled: { type: Boolean, reflect: true },
        required: { type: Boolean, reflect: true },
        name: { type: String, reflect: true },
        min: { type: String },
        max: { type: String },
        locale: { type: String },
        cancelLabel: { type: String },
        okLabel: { type: String },
        
        // Internal Reactive State
        _open: { state: true },
        _currentMonth: { state: true },
        _currentYear: { state: true },
        _selectedDate: { state: true },
        _view: { state: true }, // 'CALENDAR' | 'YEAR' | 'INPUT'
        _inputValue: { state: true },
        _focusedDay: { state: true }
    };

    static formAssociated = true;

    static styles = css`
        :host {
            display: block;
            margin-bottom: 16px;
            position: relative;
            min-height: 56px; /* Ensure visibility */
        }

        /* Dialog Styling */
        dialog {
            border: none;
            border-radius: var(--md-sys-shape-corner-large, 16px);
            background-color: var(--md-sys-color-surface-container-high);
            color: var(--md-sys-color-on-surface);
            padding: 0;
            box-shadow: var(--md-sys-elevation-3);
            overflow: hidden;
            width: 328px; /* Standard M3 width */
            max-width: 100%;
        }

        dialog::backdrop {
            background-color: rgba(0, 0, 0, 0.4);
        }

        /* Header */
        .picker-header {
            padding: 16px 56px 16px 24px; /* Increased right padding for edit button */
            border-bottom: 1px solid var(--md-sys-color-outline-variant);
            position: relative;
        }

        .header-subtitle {
            font-size: 14px;
            color: var(--md-sys-color-on-surface-variant);
            margin-bottom: 4px;
        }

        .header-title {
            font-size: 24px; /* Reduced from 32px for mobile */
            font-weight: 400;
            color: var(--md-sys-color-on-surface);
        }
        
        .edit-btn {
            position: absolute;
            right: 12px;
            bottom: 12px;
            background: none;
            border: none;
            color: var(--md-sys-color-on-surface-variant);
            cursor: pointer;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .edit-btn:hover {
            background-color: var(--md-sys-color-surface-variant);
            color: var(--md-sys-color-on-surface);
        }
        
        /* Input Mode TextField Fixes */
        m3-text-field[variant="outlined"] {
            --id-textfield-label-bg: var(--md-sys-color-surface-container-high);
        }

        /* Controls (Month/Year Nav) */
        .controls {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 12px 0 24px;
            min-height: 56px; /* consistent height */
        }

        /* Interactive Header Label as Button */
        button.current-month-label {
            background: none;
            border: none;
            font-size: 14px;
            font-weight: 500;
            font-family: inherit;
            color: var(--md-sys-color-on-surface);
            display: flex;
            align-items: center;
            cursor: pointer;
            gap: 4px;
            border-radius: 8px;
            padding: 4px 8px;
            transition: background-color var(--md-sys-motion-duration-short);
        }
        button.current-month-label:hover {
            background-color: var(--md-sys-color-surface-variant);
        }

        .nav-buttons {
            display: flex;
            gap: 4px;
            opacity: 1;
            transition: opacity var(--md-sys-motion-duration-short);
        }
        .nav-buttons.hidden {
            opacity: 0;
            pointer-events: none;
        }

        .icon-btn {
            background: none;
            border: none;
            color: var(--md-sys-color-on-surface-variant);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        .icon-btn:hover {
            background-color: var(--md-sys-color-surface-variant);
            color: var(--md-sys-color-on-surface);
        }

        /* Weekday Header */
        .custom-weekdays-header {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            padding: 12px 12px 0 12px;
            margin-bottom: 4px; /* Space between header and grid */
        }

        /* Calendar Grid */
        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            padding: 0 12px 8px 12px; /* Adjusted padding */
            row-gap: 4px;
            min-height: 240px;
        }
        
        .year-grid {
             display: grid;
             grid-template-columns: repeat(3, 1fr);
             padding: 12px;
             row-gap: 16px;
             column-gap: 8px;
             height: 240px;
             overflow-y: auto;
             align-content: start;
        }
        
        .input-container {
             padding: 24px;
        }

        .weekday-label {
            text-align: center;
            font-size: 12px;
            color: var(--md-sys-color-on-surface-variant);
            width: 40px;
            height: 40px;
            line-height: 40px;
        }

        .day-btn {
            background: none;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: var(--md-sys-color-on-surface);
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .day-btn:hover {
            background-color: var(--md-sys-color-surface-variant);
        }

        .day-btn.selected {
            background-color: var(--md-sys-color-primary);
            color: var(--md-sys-color-on-primary);
        }
        
        .day-btn.today {
            border: 1px solid var(--md-sys-color-primary);
        }
        .day-btn.selected.today {
            border: none;
        }

        /* Semantic Grid Layout */
        .calendar-grid {
            display: flex;
            flex-direction: column;
            padding: 0 12px 8px 12px;
            min-height: 240px;
        }

        .calendar-row {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            width: 100%;
            margin-bottom: 4px;
        }
        
        /* Grid Cell Wrapper */
        .day-cell {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 40px;
            height: 40px;
        }

        .year-btn {
            background: none;
            border: none;
            height: 36px;
            min-width: 72px; /* Ensure wide enough */
            padding: 0 16px;
            border-radius: 18px;
            font-size: 16px;
            line-height: 36px; /* Vertical centering fallback */
            color: var(--md-sys-color-on-surface);
            cursor: pointer;
            position: relative;
            overflow: hidden;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .year-btn:hover {
            background-color: var(--md-sys-color-surface-variant);
        }
        .year-btn.selected {
             background-color: var(--md-sys-color-primary);
             color: var(--md-sys-color-on-primary);
             font-weight: 500;
             font-size: 18px;
        }

        /* Actions */
        .actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            padding: 8px 12px 12px 12px;
        }

        .text-btn {
            background: none;
            border: none;
            padding: 10px 12px;
            border-radius: 100px;
            color: var(--md-sys-color-primary);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        .text-btn:hover {
            background-color: rgba(208, 188, 255, 0.08); /* Primary with opacity */
        }
        
        /* Standard Scrollbar */
        .year-grid {
            scrollbar-width: thin;
            scrollbar-color: var(--md-sys-color-outline) transparent;
        }
        
        /* WebKit Scrollbar */
        .year-grid::-webkit-scrollbar {
            width: 8px;
        }
        .year-grid::-webkit-scrollbar-thumb {
            background-color: var(--md-sys-color-outline);
            border-radius: 4px;
        }
        .year-grid::-webkit-scrollbar-track {
            background-color: transparent;
        }

        /* Focus Visibility for Day/Year Buttons */
        .day-btn:focus-visible,
        .year-btn:focus-visible,
        .text-btn:focus-visible,
        .icon-btn:focus-visible,
        .edit-btn:focus-visible,
        .current-month-label:focus-visible {
            outline: var(--md-sys-state-focus-ring-width) solid var(--md-sys-state-focus-ring-color);
            outline-offset: var(--md-sys-state-focus-ring-offset);
            z-index: 2;
        }
        
        /* Utility styles replacing inline styles */
        .w-full { width: 100%; }
        .pointer-auto { pointer-events: auto; }
        .pointer-none { pointer-events: none; }
        .cursor-pointer { cursor: pointer; }
        .flex { display: flex; }
        .text-on-surface-variant { color: var(--md-sys-color-on-surface-variant); }
        .flex-1 { flex: 1; }
    `;

    #internals;

    constructor() {
        super();
        this.#internals = this.attachInternals();
        this.value = '';
        
        const today = new Date();
        this._currentMonth = today.getMonth();
        this._currentYear = today.getFullYear();
        this._selectedDate = null;
        this._view = 'CALENDAR'; // Default View
        this._inputValue = '';
        this._open = false;
        this.required = false;
        this.locale = navigator.language || 'fr-FR'; 
        this.cancelLabel = 'Annuler';
        this.okLabel = 'OK';
        this._focusedDay = null;
    }

    formResetCallback() {
        this.value = this.getAttribute('value') || '';
        this.#internals.setFormValue(this.value);
        this.#syncStateFromValue();
    }
    
    formDisabledCallback(disabled) {
        this.disabled = disabled;
    }

    willUpdate(changedProperties) {
        if (changedProperties.has('value')) {
             this.#syncStateFromValue();
             this.#internals.setFormValue(this.value);
        }
    }
    
    #syncStateFromValue() {
        if (this.value) {
            const date = new Date(this.value);
            if (!Number.isNaN(date.getTime())) {
                this._selectedDate = date;
                // Sync view if not already matching selection
                   // Only execute this if date is significantly different or if initial
                if (!this._open) {
                    this._currentMonth = date.getMonth();
                    this._currentYear = date.getFullYear();
                }
            } else {
                this._selectedDate = null;
            }
        } else {
            this._selectedDate = null;
        }
    }

    updated(changedProperties) {
        // Auto-scroll year view
        if (changedProperties.has('_view') && this._view === 'YEAR') {
            this.updateComplete.then(() => {
                const selectedYearBtn = this.shadowRoot.querySelector('.year-btn.selected');
                if (selectedYearBtn) {
                    selectedYearBtn.scrollIntoView({ block: 'center' });
                }
            });
        }

        if (changedProperties.has('_currentMonth') || changedProperties.has('_currentYear')) {
             this._focusedDay = null; // Reset internal focus tracking on view change
        }
        
        if (changedProperties.has('_focusedDay') && this._focusedDay !== null) {
             const btn = this.shadowRoot.querySelector(`button[data-day="${this._focusedDay}"]`);
             if (btn) btn.focus();
        }
    }

    #formatDisplayDate(date) {
        if (!date) return '';
        return date.toLocaleDateString(this.locale);
    }

    #formatFullHeaderDate(date) {
        if (!date) return 'Date sélectionnée';
        return date.toLocaleDateString(this.locale, { weekday: 'short', day: 'numeric', month: 'short' });
    }

    #openDialog() {
        if (this.disabled) return;
        this._open = true;
        
        const target = this._selectedDate || new Date();
        this._currentMonth = target.getMonth();
        this._currentYear = target.getFullYear();
        this._view = 'CALENDAR'; 
        
        if (this._selectedDate) {
             const y = this._selectedDate.getFullYear();
             const m = String(this._selectedDate.getMonth() + 1).padStart(2, '0');
             const d = String(this._selectedDate.getDate()).padStart(2, '0');
             this._inputValue = `${d}/${m}/${y}`;
        } else {
            this._inputValue = '';
        }

        setTimeout(() => {
            const dialog = this.shadowRoot.querySelector('dialog');
            if (dialog && !dialog.open) dialog.showModal();
        }, 0);
    }

    #closeDialog() {
        const dialog = this.shadowRoot.querySelector('dialog');
        if (dialog) dialog.close();
        this._open = false;
    }

    #handleOk() {
        if (this._view === 'INPUT') {
            if (!this._inputValue || this._inputValue.trim() === '') {
                this._selectedDate = null;
            } else {
                const parts = this._inputValue.split('/');
                if (parts.length === 3) {
                     const d = Number.parseInt(parts[0]);
                     const m = Number.parseInt(parts[1]) - 1;
                     const y = Number.parseInt(parts[2]);
                     const date = new Date(y, m, d);
                     if (!Number.isNaN(date.getTime()) && date.getDate() === d) {
                         this._selectedDate = date;
                     }
                }
            }
        }

        if (this._selectedDate) {
            const y = this._selectedDate.getFullYear();
            const m = String(this._selectedDate.getMonth() + 1).padStart(2, '0');
            const d = String(this._selectedDate.getDate()).padStart(2, '0');
            this.value = `${y}-${m}-${d}`;
        } else {
            this.value = '';
        }
        
        this.#dispatchChange();
        this.#closeDialog();
    }
    
    #dispatchChange() {
        this.#internals.setFormValue(this.value);
        this.dispatchEvent(new CustomEvent('change', {
            detail: { value: this.value },
            bubbles: true,
            composed: true
        }));
    }

    #handleCancel() {
        this.#closeDialog();
    }

    #handleDialogClose() {
        this._open = false;
    }

    async #prevMonth() {
        const grid = this.shadowRoot.querySelector('.calendar-grid');
        if (grid) {
            const anim = grid.animate([
                { transform: 'translateX(0)', opacity: 1 },
                { transform: 'translateX(50px)', opacity: 0 }
            ], { duration: 100, easing: 'ease-in' });
            await anim.finished;
        }

        if (this._currentMonth === 0) {
            this._currentMonth = 11;
            this._currentYear -= 1;
        } else {
            this._currentMonth -= 1;
        }
        
        await this.updateComplete;
        
        const newGrid = this.shadowRoot.querySelector('.calendar-grid');
        if (newGrid) {
            newGrid.animate([
                { transform: 'translateX(-50px)', opacity: 0 },
                { transform: 'translateX(0)', opacity: 1 }
            ], { duration: 150, easing: 'ease-out' });
        }
    }

    async #nextMonth() {
        const grid = this.shadowRoot.querySelector('.calendar-grid');
        if (grid) {
            const anim = grid.animate([
                { transform: 'translateX(0)', opacity: 1 },
                { transform: 'translateX(-50px)', opacity: 0 }
            ], { duration: 100, easing: 'ease-in' });
            await anim.finished;
        }

        if (this._currentMonth === 11) {
            this._currentMonth = 0;
            this._currentYear += 1;
        } else {
            this._currentMonth += 1;
        }
        
        await this.updateComplete;
        
        const newGrid = this.shadowRoot.querySelector('.calendar-grid');
        if (newGrid) {
            newGrid.animate([
                { transform: 'translateX(50px)', opacity: 0 },
                { transform: 'translateX(0)', opacity: 1 }
            ], { duration: 150, easing: 'ease-out' });
        }
    }

    // Touch State
    #touchStartX = 0;
    #touchStartY = 0;

    #handleTouchStart(e) {
        this.#touchStartX = e.changedTouches[0].screenX;
        this.#touchStartY = e.changedTouches[0].screenY;
    }

    #handleTouchEnd(e) {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        
        const deltaX = touchEndX - this.#touchStartX;
        const deltaY = touchEndY - this.#touchStartY;
        
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                this.#prevMonth();
            } else {
                this.#nextMonth();
            }
        }
    }

    // Event Delegation for Grid
    #handleGridClick(e) {
        // Find the button if clicked inside
        const btn = e.target.closest('.day-btn');
        if (!btn) return;
        
        const day = parseInt(btn.getAttribute('data-day'), 10);
        if (isNaN(day)) return;
        
        this.#selectDay(day);
    }

    #selectDay(day) {
        this._selectedDate = new Date(this._currentYear, this._currentMonth, day);
        // Also update input value logic
        const y = this._selectedDate.getFullYear();
        const m = String(this._selectedDate.getMonth() + 1).padStart(2, '0');
        const d = String(this._selectedDate.getDate()).padStart(2, '0');
        this._inputValue = `${d}/${m}/${y}`;
    }

    #toggleView() {
        this._view = (this._view === 'CALENDAR' || this._view === 'INPUT') ? 'YEAR' : 'CALENDAR';
    }
    
    #selectYear(year) {
        this._currentYear = year;
        this._view = 'CALENDAR'; 
    }

    #toggleInputMode() {
        this._view = this._view === 'INPUT' ? 'CALENDAR' : 'INPUT';
    }

    #handleInputChange(e) {
        this._inputValue = e.target.value;
    }

    async #handleGridKeyDown(e) {
         // Only handle arrow keys on day buttons
         if (!e.target.matches('.day-btn')) return;
         
         const key = e.key;
         if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
         
         e.preventDefault();
         
         const currentDay = parseInt(e.target.getAttribute('data-day'), 10);
         const daysInMonth = new Date(this._currentYear, this._currentMonth + 1, 0).getDate();
         
         let newDay = currentDay;
         
         switch (key) {
             case 'ArrowLeft': newDay -= 1; break;
             case 'ArrowRight': newDay += 1; break;
             case 'ArrowUp': newDay -= 7; break;
             case 'ArrowDown': newDay += 7; break;
             case 'Home': newDay = 1; break;
             case 'End': newDay = daysInMonth; break;
         }

         if (newDay < 1) {
             await this.#prevMonth();
             // Focus last day of previous month
             const prevMonthDays = new Date(this._currentYear, this._currentMonth + 1, 0).getDate();
             this._focusedDay = prevMonthDays; // Will trigger focus in updated()
         } else if (newDay > daysInMonth) {
             await this.#nextMonth();
             this._focusedDay = 1; // Focus first day of next month
         } else {
             this._focusedDay = newDay;
             
             // Ensure the new focused day is visible (if we were scrolling, which we aren't really)
             // But we trigger an update to ensure tabindex maps correctly immediately if needed, 
             // though standard Lit update cycle handles it via property change specific to focusedDay?
             // Actually _focusedDay is a state property, so it triggers render.
             // The updated() callback will then focus the element.
         }
    }

    _getCalendarDays() {
         const firstDayOfMonth = new Date(this._currentYear, this._currentMonth, 1).getDay();
         const startOffset = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); // Monday start
         const daysInMonth = new Date(this._currentYear, this._currentMonth + 1, 0).getDate();

         // Chunk days into weeks (rows)
         const weeks = [];
         let currentWeek = [];
         
         // Add leading empty cells
         for (let i = 0; i < startOffset; i++) {
             currentWeek.push(html`<div class="day-cell" role="gridcell"></div>`);
         }
         
         const today = new Date();
         const isCurrentMonthNow = today.getMonth() === this._currentMonth && today.getFullYear() === this._currentYear;

         // Roving Tab Index Logic
         let focusTarget = 1;
         const hasSelectionInView = this._selectedDate && 
                                    this._selectedDate.getMonth() === this._currentMonth && 
                                    this._selectedDate.getFullYear() === this._currentYear;

         if (this._focusedDay !== null) {
             focusTarget = this._focusedDay;
         } else if (hasSelectionInView) {
             focusTarget = this._selectedDate.getDate();
         } else if (isCurrentMonthNow) {
              focusTarget = today.getDate();
         }

         for (let i = 1; i <= daysInMonth; i++) {
             const isToday = isCurrentMonthNow && today.getDate() === i;
             const isSelected = this._selectedDate && 
                                this._selectedDate.getDate() === i && 
                                this._selectedDate.getMonth() === this._currentMonth &&
                                this._selectedDate.getFullYear() === this._currentYear;

             const tabIndex = (i === focusTarget) ? 0 : -1;

             const dayHtml = html`
                 <div class="day-cell" role="gridcell">
                     <button 
                         class="day-btn ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}" 
                         aria-label="${i}"
                         aria-selected="${isSelected}"
                         tabindex="${tabIndex}"
                         data-day="${i}"
                     >
                         ${i}
                         <m3-ripple></m3-ripple>
                     </button>
                 </div>
             `;
             
             currentWeek.push(dayHtml);
             
             if (currentWeek.length === 7) {
                 weeks.push(currentWeek);
                 currentWeek = [];
             }
         }
         
         // Fill remaining cells in last week
         if (currentWeek.length > 0) {
             while (currentWeek.length < 7) {
                 currentWeek.push(html`<div class="day-cell" role="gridcell"></div>`);
             }
             weeks.push(currentWeek);
         }
         return weeks;
    }

    render() {
        const displayValue = this._selectedDate ? this.#formatDisplayDate(this._selectedDate) : '';
        const monthName = new Date(this._currentYear, this._currentMonth).toLocaleDateString(this.locale, { month: 'long', year: 'numeric' });
        const monthNameCap = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        
        let content;
        
        if (this._view === 'CALENDAR') {
            const weeks = this._getCalendarDays();
            
            content = html`
                <div class="controls">
                    <button class="current-month-label" @click="${this.#toggleView}" aria-label="Changer l'année">
                        ${monthNameCap}
                        <m3-icon icon="${this._view === 'CALENDAR' ? 'arrow_drop_down' : 'arrow_drop_up'}"></m3-icon>
                    </button>
                    
                    <div class="nav-buttons">
                        <button type="button" class="icon-btn" @click="${(e) => { e.stopPropagation(); this.#prevMonth(); }}" aria-label="Mois précédent">
                            <m3-icon icon="chevron_left" style="pointer-events: none;"></m3-icon>
                            <m3-ripple></m3-ripple>
                        </button>
                        <button type="button" class="icon-btn" @click="${(e) => { e.stopPropagation(); this.#nextMonth(); }}" aria-label="Mois suivant">
                            <m3-icon icon="chevron_right" style="pointer-events: none;"></m3-icon>
                            <m3-ripple></m3-ripple>
                        </button>
                    </div>
                </div>

                <div role="grid" aria-label="${monthNameCap} ${this._currentYear}">
                    <div class="custom-weekdays-header" role="row">
                        <div class="weekday-label" role="columnheader" aria-label="Lundi">L</div>
                        <div class="weekday-label" role="columnheader" aria-label="Mardi">M</div>
                        <div class="weekday-label" role="columnheader" aria-label="Mercredi">M</div>
                        <div class="weekday-label" role="columnheader" aria-label="Jeudi">J</div>
                        <div class="weekday-label" role="columnheader" aria-label="Vendredi">V</div>
                        <div class="weekday-label" role="columnheader" aria-label="Samedi">S</div>
                        <div class="weekday-label" role="columnheader" aria-label="Dimanche">D</div>
                    </div>
                    <div class="calendar-grid" @click="${this.#handleGridClick}" @keydown="${this.#handleGridKeyDown}" role="rowgroup">
                        ${weeks.map(week => html`
                            <div class="calendar-row" role="row">
                                ${week}
                            </div>
                        `)}
                    </div>
                </div>
            `;
        } else if (this._view === 'YEAR') {
            const currentYear = new Date().getFullYear();
            const startYear = currentYear - 100;
            const endYear = currentYear + 100;
            const years = [];
            
            for (let i = startYear; i <= endYear; i++) {
                const isSelected = this._currentYear === i;
                 years.push(html`
                    <button 
                        class="year-btn ${isSelected ? 'selected' : ''}" 
                        @click="${() => this.#selectYear(i)}"
                        aria-selected="${isSelected}"
                    >
                        ${i}
                        <m3-ripple></m3-ripple>
                    </button>
                `);
            }
            
            content = html`
                <div class="controls">
                     <button class="current-month-label" @click="${() => this.#toggleView()}">
                        ${monthNameCap}
                        <m3-icon icon="arrow_drop_up"></m3-icon>
                    </button>
                </div>
                <div class="year-grid">${years}</div>
            `;
        } else {
            content = html`
                <div class="input-container">
                    <m3-text-field
                        label="Date"
                        placeholder="JJ/MM/AAAA"
                        .value="${this._inputValue}"
                        @input="${(e) => this.#handleInputChange(e)}"
                        variant="outlined"
                        class="w-full"
                    >
                    </m3-text-field>
                </div>
            `;
        }
        
        const headerTitle = this._view === 'INPUT' ? 'Saisir une date' : this.#formatFullHeaderDate(this._selectedDate);
        const headerSubtitle = 'Sélectionner une date'; 

        return html`
            <!-- Trigger Input -->
            <!-- Trigger Input -->
            <!-- Trigger Input -->
             <m3-text-field 
                label="${this.label}" 
                .value="${displayValue}" 
                readonly 
                @click="${() => this.#openDialog()}"
                @keydown="${(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.#openDialog();
                    }
                }}"
                class="cursor-pointer"
            >
            </m3-text-field>

            <!-- Modal Dialog -->
            <dialog 
                @click="${(e) => e.target === e.currentTarget && this.#handleCancel()}"
                @touchstart="${this.#handleTouchStart}"
                @touchend="${this.#handleTouchEnd}"
                @close="${this.#handleDialogClose}"
            >
                <div class="picker-header">
                    <div class="header-subtitle">${headerSubtitle}</div>
                    <div class="header-title">${headerTitle}</div>
                    
                    <button class="edit-btn" @click="${() => this.#toggleInputMode()}" aria-label="Changer le mode de saisie">
                        <m3-icon icon="${this._view === 'INPUT' ? 'calendar_today' : 'edit'}"></m3-icon>
                        <m3-ripple></m3-ripple>
                    </button>
                </div>

                ${content}

                <div class="actions">
                    <div class="flex-1"></div>
                    <button class="text-btn" @click="${this.#handleCancel}">${this.cancelLabel}</button>
                    <button class="text-btn" @click="${this.#handleOk}">${this.okLabel}</button>
                </div>
            </dialog>
        `;
    }
}

customElements.define('m3-date-picker', M3DatePicker);
