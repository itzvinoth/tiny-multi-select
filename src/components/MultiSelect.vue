<template>
  <div :style="containerStyle" class="multiselect">
  	<p v-show="false"> {{ currItem }}</p>
  	<div id="inputDiv" :style="inputStyle" @click="keyCapture($event)">
  		<ul class="choice-list">
			<li class="choice" v-for="(data, index) in selectedValues"> {{ data[label] }} <span class="close" @click="clearItem($event, data)">&times;</span></li>
			<li class="choice">
				<input type="text" class="search" ref="listSearch" v-model="keywords" @focus="onFocus" @keydown="keyMonitor"></input>
			</li>
		</ul>
  	</div>
  	<ul v-show="showLabels" class="selection-labels" id="labels" :style="labelsStyle">
      <li class="selection-choice" @keyup="navOnLabel" @keypress="enterPress" v-for="(data, index) in filteredOptions" :class="{navColor: data.navigate, selected: data.selected}" @click="onLabelClick(data, index)"> {{ data[label] }} </li>
    </ul>
  </div>
</template>

<script>
export default {
	name: 'MultiSelect',
	data() {
		return {
			showLabels: false,
			keywords: '',
			currItem: 1,
			divHeight: 0
		}
	},
	props: {
		options: {
			type: [Object, Array],
			required: true
		},
		multiple: {
			type: Boolean,
			required: false
		},
		trackBy: {
			type: String,
			required: false
		},
		width: {
			type: [Number, String],
			required: false
		},
		label: {
			type: String,
			required: false
		},
		selectedValues: {
			type: [Object, Array],
			required: false
		},
		placeHolder: {
			type: String,
			required: false
		}
	},
	beforeMount: function() {
		this.options.map((item, index) => {
			item.navigate = false
			item.itemId = index + 1
			if (this.selectedValues.map(val => val.name).indexOf(item.name) > -1) {
				item.selected = true
			} else {
				item.selected = false
			}
		})
	},
	created: function () {
		this.heightChange()
	},
	updated: function () {
		this.heightChange()
	},
	mounted () {
		document.addEventListener("keyup", this.navOnLabel)
		document.addEventListener("keypress", this.enterPress)
		window.addEventListener("click", this.checkElement)
	},
	destroyed () {
		document.removeEventListener("keyup", this.navOnLabel)
		document.removeEventListener("keypress", this.enterPress)
		window.removeEventListener("click", this.checkElement)
	},
	methods: {
		checkElement: function (event) {
			if (document.getElementsByClassName('multiselect')[0].contains(event.target)) {
				this.showLabels = true
			} else {
				this.showLabels = false
			}
		},
		keyMonitor: function(event) {
			if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 97 && event.keyCode <= 122) || (event.keyCode == 8)) {
				if (this.keywords.length <= 0 && event.keyCode == 8 && this.selectedValues.length > 0) {
					for (var key in this.filteredOptions) {
						if (this.filteredOptions[key][this.trackBy].indexOf(this.selectedValues[this.selectedValues.length -1][this.trackBy]) > -1) {
							this.selectedValues.splice((this.selectedValues.length-1), 1)
							this.filteredOptions[key].selected = !this.filteredOptions[key].selected
							break
						}
					}
				}
				this.$nextTick(() => {
					this.keywords = event.target.value
					this.currItem = 1
						
				})
			}
		},
		heightChange: function () {
			let str = this.selectedValues.join()
			this.divHeight = (Math.ceil((str.length+1) / 45)) * 40
		},
		keyCapture: function(event) {
			this.$nextTick(() => {
				this.$refs.listSearch.focus()
			})
		},
		clearItem: function(event, selectedItem) {
			// Deselects or removes the element from the multi-select div when clicking the close button...
			this.filteredOptions.map((item, index) => {
				if (item[this.trackBy].indexOf(selectedItem[this.trackBy]) > -1) {
					this.selectedValues.splice(this.selectedValues.map(sVal => sVal[this.trackBy]).indexOf(selectedItem[this.trackBy]), 1)
					item.selected = !item.selected
				}
			})
		},
		onFocus: function() {
			this.showLabels = true
		},
		onLabelClick: function(data, index) {
			// Selects or append the elements to the multi-select div when clicking on the list elements...
			data.selected = !data.selected
			// this.showLabels = true
			this.keywords = ''
			this.filteredOptions.map(item => {
				if (item[this.trackBy].toLowerCase().indexOf(data[this.trackBy].toLowerCase()) > -1 && item.selected == true) {
					let sValue = {}
					sValue[this.trackBy] = item[this.trackBy]
					sValue[this.label] = item[this.label]
					this.selectedValues.push(sValue)
				} else if (item[this.trackBy].toLowerCase().indexOf(data[this.trackBy].toLowerCase()) > -1 && item.selected == false) {
					this.selectedValues.splice(this.selectedValues.map(sVal => sVal[this.trackBy]).indexOf(data[this.trackBy]), 1)
				}
			})
		},
		navOnLabel: function () {
			// Naviate through label items on key up & down 
			let getLabel = document.getElementById('labels')
			if (event.keyCode == 38) {
				if (this.currItem !== 1) {
					this.currItem--
					getLabel.scrollBy(0, -20)
				} else {
					this.currItem = this.currItem + this.filteredOptions.length-1
					getLabel.scrollBy(0, (20*this.filteredOptions.length-1))
				}
			} else if (event.keyCode == 40) {
				if (this.currItem !== this.filteredOptions.length) {
					this.currItem++
					getLabel.scrollBy(0, 20)
				} else {
					this.currItem = this.currItem - (this.filteredOptions.length-1)
					getLabel.scrollBy(0, (-20*this.filteredOptions.length-1))
				}
			}
			this.filteredOptions.map((item, index) => {
				if (item[this.trackBy] == this.filteredOptions[this.currItem-1][this.trackBy]) {
					item.navigate = true
				} else {
					item.navigate = false
				}
			})
		},
		enterPress: function () {
			// Select & Deselect Labels on keypress Enter  
			if (event.keyCode == 13) {
				if (this.filteredOptions[this.currItem - 1].selected == false) {
					let sValue = {}
					this.filteredOptions[this.currItem - 1].selected = true
					sValue[this.trackBy] = this.filteredOptions[this.currItem - 1][this.trackBy]
					sValue[this.label] = this.filteredOptions[this.currItem - 1][this.label]
					this.selectedValues.push(sValue)
					this.keywords = ''
					// this.currItem = 1
				} else {
					this.selectedValues.splice(this.selectedValues.map(sVal => sVal[this.trackBy]).indexOf(this.filteredOptions[this.currItem - 1][this.trackBy]), 1)
					this.filteredOptions[this.currItem - 1].selected = false
				}
			}
		}
	},
	computed: {
		// Filter Lists based upon search 
		filteredOptions: function() {
			return this.options.filter(item => {
				return item[this.trackBy].toLowerCase().indexOf(this.keywords.toLowerCase()) > -1
			})
		},	
		// Conditional style rendering
		containerStyle: function () {
			return { width: (this.width !== undefined ? this.width+'px': '300px') }
		},
		inputStyle: function () {
			return { height: this.divHeight+'px' }
		},
		labelsStyle: function () {
			return { position: 'absolute', width: (this.width !== undefined ? this.width+'px': '300px') }
		}
	}
}
</script>

<style>
#inputDiv {
  border: 1px solid #CCC;
  width: 100%;
}
.selected {
  background: #41c69e;
}
.navColor {
  color: #c0f0e1;
}
ul.choice-list {
  list-style-type: none;
  padding: 0;
  display: inline-block;
  margin: 5px 0; 
}
ul.selection-labels {
  list-style-type: none;
  padding: 0;
  border: 1px solid #CCC;
  background-color: #FFF;
  display: inline-block;
  max-height: 100px;
  overflow-y: auto;
}
li.selection-choice {
  padding: 4px;
  text-align: left;
  position: relative;
}
li.choice {
  cursor: pointer;
  float: left;
  display: inline-block;
  border: 1px solid #CCC;
  border-radius: 2px;
  padding-left: 4px;
  padding-top: 4px;
  padding-bottom: 4px;
  padding-right: 14px;
  margin-left: 5px;
  margin-bottom: 4px;
  display: block;
  position: relative;
}
li.choice:last-child {border: 0;}
a {color: #42b983;}
.close {
  cursor: pointer;
  position: absolute;
  top: 50%;
  right: 0%;
  transform: translate(0%, -50%);
}
.close:hover {background: #bbb;}
input.search {
	border: 0;
	width: 65px;
}
input.search:focus{
  outline: none;
}
</style>