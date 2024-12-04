export const calculateTaskBudget = (tache_id, budgetType, budgets) => {
    const relevantBudget = budgets.find(
        budget => budget.tache_id === tache_id &&
            budget.subtype === `budget_${budgetType}` &&
            budget.type === 'previsionnel'
    );

    if (!relevantBudget) return 0;
    return relevantBudget.prix_unitaire * relevantBudget.quantite;
};

export const calculateTotals = (tasks, budgets) => {
    let moTotal = 0;
    let materiauxTotal = 0;
    let materielTotal = 0;
    let sousTraitanceTotal = 0;

    tasks.forEach(task => {
        moTotal += calculateTaskBudget(task.id, 'mo', budgets);
        materiauxTotal += calculateTaskBudget(task.id, 'materiaux', budgets);
        materielTotal += calculateTaskBudget(task.id, 'materiel', budgets);
        sousTraitanceTotal += calculateTaskBudget(task.id, 'sous_traitance', budgets);
    });

    return {
        moTotal,
        materiauxTotal,
        materielTotal,
        sousTraitanceTotal,
        total: moTotal + materiauxTotal + materielTotal + sousTraitanceTotal
    };
};

export const formatPrice = (price) => {
    return price.toLocaleString('fr-FR') + ' €';
};

export const getWorkTasks = (ouvrage_id, tasks) => {
    return tasks.filter(task => task.ouvrage_id === ouvrage_id);
};