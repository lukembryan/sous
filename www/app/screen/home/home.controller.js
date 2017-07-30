'use strict';

angular.module('recipeMerger')
	.controller('homeController', function($scope, $rootScope, $state, $timeout, recipes) {
	    $scope.home = {
				menu: [],
				height: 4,
				menuStart: null,
				menuFinish: null,
				recipeLength: 0,
				elapsedTime: null,
				currentSteps: null,
				stepFinishes: [],
				recipeFinishes: [],
				merge: function(){
					this.menu = [];

					var mostSteps = 0;
					this.stepFinishes = [];

					angular.forEach($rootScope.data, function(recipe, recipeNumber){
						var minute = 5 * Math.round(moment(recipe.finishTime).minute()/5);
						recipe.finishTime = moment(recipe.finishTime).set({'minute': minute});

						if(recipe.steps.length > mostSteps) mostSteps = recipe.steps.length;

						$scope.home.stepFinishes[recipeNumber] = angular.copy(recipe.finishTime);
					});

					this.recipeFinishes = angular.copy(this.stepFinishes);

					var recipes = angular.copy($rootScope.data);

					recipes.sort(function(a ,b){ return new Date(b.finishTime) - new Date(a.finishTime); });

					this.menuFinish = moment(recipes[0].finishTime);

					for(var i=0; i<mostSteps; i++){
						angular.forEach($rootScope.data, function(recipe, recipeNumber){
							var steps = angular.copy(recipe.steps).reverse();

							if(steps[i]){
								steps[i].recipe = recipeNumber;
								steps[i].number = steps.length - i - 1;
								steps[i].category = recipe.category;

								//console.log(i, steps[i].description);

								var shift = 0;

								if(steps[i].parallel && steps[i].overlap){
									//console.log((steps[i].recipe + 1) + ' - ' + (steps[i].number + 1) + ' wait, overlap: ' + steps[i].overlap);
									angular.forEach(steps[i].overlap, function(overlapStep){
										//console.log(i, overlapStep, steps.length - overlapStep - 1);
										overlapStep = steps.length - overlapStep - 1;
										shift += steps[overlapStep].duration;
									});
									//console.log('shift', shift);
								}

								$scope.home.setStepTime(steps[i], $scope.home.stepFinishes[recipeNumber].add(shift, 'minutes'));

								var stepIndex = $scope.home.menu.push(steps[i]) - 1;

								$scope.home.stepFinishes[recipeNumber].subtract(steps[i].duration, 'minutes');
								$scope.home.checkOverlaps(stepIndex, steps[i]);
							}
						});
					}

					this.calculateRecipeLength();
					this.elapsedTime = moment(this.menuFinish).subtract(this.recipeLength, 'minutes').format();
					this.moveTimeMarker();
				},
				stepFinishOffset: function(finish){
					return moment($scope.home.menuFinish).diff(finish, 'minutes') - 5;
				},
				setStepTime: function(step, stepFinish){
					step.startTime = angular.copy(stepFinish).subtract(step.duration, 'minutes');
					step.finishTime = angular.copy(stepFinish);
					step.offset = moment($scope.home.menuFinish).diff(step.finishTime, 'minutes');
				},
				formatTime: function(timeObject){
					return timeObject.format();
				},
				checkOverlaps: function(stepIndex, stepToCheck){
					var recipeCount = $rootScope.data.length;

					for(var i=0; i<recipeCount; i++){
						angular.forEach($scope.home.menu, function(step, stepNumber){
							if(stepIndex !== stepNumber){
								var startOverlap = moment(stepToCheck.startTime).isBetween(step.startTime, step.finishTime, 'minute', '[)');
								var finishOverlap = moment(stepToCheck.finishTime).isBetween(step.startTime, step.finishTime, 'minute', '(]');
								var allOverlap = moment(stepToCheck.startTime).isSameOrBefore(step.startTime) && moment(stepToCheck.finishTime).isSameOrAfter(step.finishTime);

								var stepTime = (stepToCheck.recipe + 1) + '|' + (stepToCheck.number + 1);
								var checkRange = (step.recipe + 1) + '|' + (step.number + 1);

								if(startOverlap || finishOverlap || allOverlap){
									if(!stepToCheck.parallel || (stepToCheck.parallel && step.parallel)){
										//console.log(stepTime, stepToCheck.startTime.format('hh:mm'), stepToCheck.finishTime.format('hh:mm'), ' - ', checkRange, step.startTime.format('hh:mm'), step.finishTime.format('hh:mm'));
										$scope.home.setStepTime(stepToCheck, step.startTime);
										//console.log('new range', stepToCheck.startTime.format('hh:mm'), stepToCheck.finishTime.format('hh:mm'));
										//console.log('--------');
										//$scope.home.stepFinishes[stepToCheck.recipe] = angular.copy(step.startTime).subtract(stepToCheck.duration, 'minutes');
									}
								}
							}
						});
					}
				},
				calculateRecipeLength: function(){
					var menu = angular.copy(this.menu);

					menu.sort(function(a ,b){ return new Date(a.startTime) - new Date(b.startTime); });

					this.menuStart = menu[0].finishTime.subtract(menu[0].duration, 'minutes');
					this.recipeLength = this.menuFinish.diff(this.menuStart, 'minutes');
				},
				moveTimeMarker: function(){
					var elapsedTime = moment(angular.copy(this.elapsedTime));
					this.elapsedTimePosition = this.menuFinish.diff(elapsedTime, 'minutes');

					var currentSteps = [];

					angular.forEach(this.menu, function(step){
						step.active = moment(elapsedTime).isBetween(step.startTime, step.finishTime, 'minute', '[)');
						if(step.active) currentSteps.push(step);
					});

					this.currentSteps = currentSteps;

					$rootScope.adjustHeight();
				},
				stepClass: function(step){
					var classList = '';
					if(step.parallel) classList += ' wait';
					if(step.active) classList += ' active';
					return classList;
				}
			};

	    recipes.fromFile('99eee451-7887-7a7a-424d-c0c5be756021');
	    recipes.fromFile('f1d2e24a-d4d7-48e6-9211-2793aed6cb10');
	});
