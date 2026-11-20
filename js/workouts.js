/**
 * FITZONE - Workouts Management Controller
 * Plan templates, exercises builder, assignment to gym members
 */

document.addEventListener('DOMContentLoaded', () => {
  WorkoutsCtrl.init();
});

const WorkoutsCtrl = {
  init() {
    this.renderPlans();
    this.populateMemberSelect();
  },

  populateMemberSelect() {
    const select = document.getElementById('assign-workout-member-select');
    if (!select) return;

    const members = DB.get('members');
    select.innerHTML = `<option value="">Select Member...</option>` + 
      members.map(m => `
        <option value="${m.id}">
          ${m.name} (${m.id}) - Current: ${m.workoutPlanName || 'None'}
        </option>
      `).join('');
  },

  renderPlans() {
    const container = document.getElementById('workouts-cards-container');
    if (!container) return;

    const workouts = DB.get('workouts');
    const members = DB.get('members');

    container.innerHTML = workouts.map(w => {
      // Count members assigned to this plan
      const assignedCount = members.filter(m => m.workoutPlanId === w.id).length;

      let badgeColor = 'badge-primary';
      if (w.difficulty === 'Beginner') badgeColor = 'badge-success';
      if (w.difficulty === 'Advanced') badgeColor = 'badge-danger';

      return `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div class="flex items-center justify-between" style="margin-bottom: 0.75rem;">
              <span class="badge ${badgeColor}">${w.difficulty}</span>
              <span class="badge badge-secondary"><i class="fa-solid fa-calendar-days"></i> ${w.daysPerWeek} Days / Wk</span>
            </div>

            <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem; color: #ffffff;">${w.title}</h3>
            <p class="text-secondary" style="font-size: 0.86rem; margin-bottom: 1rem; line-height: 1.5;">${w.description}</p>
            
            <div style="background: var(--bg-surface); border-radius: var(--radius-md); padding: 0.85rem; margin-bottom: 1.25rem;">
              <div class="flex justify-between items-center" style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.35rem;">
                <span>Total Exercises:</span>
                <strong class="text-main">${w.exercises.length} Movements</strong>
              </div>
              <div class="flex justify-between items-center" style="font-size: 0.82rem; color: var(--text-muted);">
                <span>Active Enrolled Members:</span>
                <strong class="text-primary font-bold">${assignedCount} Members</strong>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button class="btn btn-outline btn-sm flex-1" onclick="WorkoutsCtrl.viewPlanDetails('${w.id}')">
              <i class="fa-solid fa-list-check"></i> Exercises
            </button>
            <button class="btn btn-primary btn-sm flex-1" onclick="WorkoutsCtrl.openAssignModal('${w.id}')">
              <i class="fa-solid fa-user-plus"></i> Assign
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  viewPlanDetails(planId) {
    const plan = DB.getById('workouts', planId);
    if (!plan) return;

    document.getElementById('plan-detail-title').textContent = plan.title;
    document.getElementById('plan-detail-meta').textContent = `${plan.category} • ${plan.difficulty} • ${plan.daysPerWeek} Days/Week`;
    document.getElementById('plan-detail-goal').textContent = plan.targetGoal;
    document.getElementById('plan-detail-desc').textContent = plan.description;

    const listEl = document.getElementById('plan-exercises-list');
    if (listEl) {
      listEl.innerHTML = `
        <table class="table" style="font-size: 0.88rem;">
          <thead>
            <tr>
              <th>#</th>
              <th>Exercise Name</th>
              <th>Target Muscle</th>
              <th>Sets</th>
              <th>Reps</th>
              <th>Rest</th>
              <th>Form Notes</th>
            </tr>
          </thead>
          <tbody>
            ${plan.exercises.map((ex, i) => `
              <tr>
                <td class="font-bold text-primary">${i + 1}</td>
                <td class="font-bold">${ex.name}</td>
                <td><span class="badge badge-secondary">${ex.muscle}</span></td>
                <td>${ex.sets}</td>
                <td><span class="font-bold">${ex.reps}</span></td>
                <td>${ex.restSec}s</td>
                <td class="text-muted" style="font-size: 0.8rem;">${ex.notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    App.openModal('workout-details-modal');
  },

  openAssignModal(planId) {
    const plan = DB.getById('workouts', planId);
    if (!plan) return;

    document.getElementById('assign-plan-id').value = plan.id;
    document.getElementById('assign-plan-title-display').textContent = plan.title;
    this.populateMemberSelect();

    App.openModal('assign-workout-modal');
  },

  processAssignment(event) {
    event.preventDefault();
    const planId = document.getElementById('assign-plan-id').value;
    const memberId = document.getElementById('assign-workout-member-select').value;

    const plan = DB.getById('workouts', planId);
    const member = DB.getById('members', memberId);

    if (!plan || !member) {
      App.showToast("Please select a valid member.", "error");
      return;
    }

    // Update member workout plan
    DB.update('members', member.id, {
      workoutPlanId: plan.id,
      workoutPlanName: plan.title
    });

    App.closeModal('assign-workout-modal');
    App.showToast(`Workout plan "${plan.title}" assigned to ${member.name}!`, "success");
    this.renderPlans();
  },

  openCreatePlanModal() {
    const form = document.getElementById('create-workout-form');
    if (form) form.reset();

    // Default 3 sample exercise rows
    const container = document.getElementById('exercise-rows-container');
    if (container) {
      container.innerHTML = `
        <div class="exercise-input-row form-row" style="margin-bottom: 0.75rem; background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-md);">
          <input type="text" class="form-control ex-name" placeholder="Exercise Name (e.g. Bench Press)" required>
          <input type="text" class="form-control ex-muscle" placeholder="Muscle (e.g. Chest)" required>
          <input type="number" class="form-control ex-sets" placeholder="Sets" value="4" style="max-width: 80px;" required>
          <input type="text" class="form-control ex-reps" placeholder="Reps" value="10-12" style="max-width: 100px;" required>
          <input type="number" class="form-control ex-rest" placeholder="Rest(s)" value="60" style="max-width: 90px;" required>
          <input type="text" class="form-control ex-notes" placeholder="Execution cues">
        </div>
      `;
    }

    App.openModal('create-workout-modal');
  },

  addExerciseRow() {
    const container = document.getElementById('exercise-rows-container');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'exercise-input-row form-row';
    row.style = 'margin-bottom: 0.75rem; background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-md);';
    row.innerHTML = `
      <input type="text" class="form-control ex-name" placeholder="Exercise Name" required>
      <input type="text" class="form-control ex-muscle" placeholder="Target Muscle" required>
      <input type="number" class="form-control ex-sets" placeholder="Sets" value="3" style="max-width: 80px;" required>
      <input type="text" class="form-control ex-reps" placeholder="Reps" value="12" style="max-width: 100px;" required>
      <input type="number" class="form-control ex-rest" placeholder="Rest(s)" value="45" style="max-width: 90px;" required>
      <input type="text" class="form-control ex-notes" placeholder="Execution cues">
      <button type="button" class="btn btn-outline text-danger btn-sm" onclick="this.parentElement.remove()" style="padding: 0 0.5rem;"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(row);
  },

  saveNewWorkout(event) {
    event.preventDefault();
    const title = document.getElementById('new-plan-title').value.trim();
    const category = document.getElementById('new-plan-category').value;
    const difficulty = document.getElementById('new-plan-difficulty').value;
    const daysPerWeek = parseInt(document.getElementById('new-plan-days').value, 10) || 3;
    const targetGoal = document.getElementById('new-plan-goal').value.trim();
    const description = document.getElementById('new-plan-desc').value.trim();

    const rows = document.querySelectorAll('.exercise-input-row');
    const exercises = [];
    rows.forEach(r => {
      const name = r.querySelector('.ex-name').value.trim();
      const muscle = r.querySelector('.ex-muscle').value.trim();
      const sets = parseInt(r.querySelector('.ex-sets').value, 10) || 3;
      const reps = r.querySelector('.ex-reps').value.trim() || '10';
      const restSec = parseInt(r.querySelector('.ex-rest').value, 10) || 60;
      const notes = r.querySelector('.ex-notes').value.trim();

      if (name) {
        exercises.push({ name, muscle, sets, reps, restSec, notes });
      }
    });

    if (exercises.length === 0) {
      App.showToast("Please add at least one exercise to the plan.", "error");
      return;
    }

    const newPlan = {
      id: `wp-${Date.now().toString().slice(-4)}`,
      title,
      category,
      difficulty,
      daysPerWeek,
      targetGoal,
      description,
      assignedMembersCount: 0,
      exercises
    };

    DB.add('workouts', newPlan);
    App.closeModal('create-workout-modal');
    App.showToast(`Workout plan "${title}" created successfully!`, "success");
    this.renderPlans();
  }
};
