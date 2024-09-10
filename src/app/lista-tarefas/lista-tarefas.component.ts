import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TarefaService } from 'src/app/service/tarefa.service';
import { Tarefa } from '../interface/tarefa';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { filter, Subscription } from 'rxjs';
import {
  checkButtonTrigger,
  filterTrigger,
  flyInOutTrigger,
  formButtonTrigger,
  highlightedStateTrigger,
  shakeTrigger,
  shownStateTrigger,
} from '../animations';

@Component({
  selector: 'app-lista-tarefas',
  templateUrl: './lista-tarefas.component.html',
  styleUrls: ['./lista-tarefas.component.css'],
  animations: [
    highlightedStateTrigger,
    shownStateTrigger,
    checkButtonTrigger,
    filterTrigger,
    formButtonTrigger,
    flyInOutTrigger,
    shakeTrigger,
  ],
})
export class ListaTarefasComponent implements OnInit {
  listaTarefas: Tarefa[] = [];
  listaTarefasOriginal: Tarefa[] = [];
  formAberto: boolean = false;
  categoria: string = '';
  validado: boolean = false;
  indexTarefa: number = -1;
  id: number = 0;
  campoBusca: string = '';
  tarefasSubscription: Subscription = new Subscription();
  estadoBotao: string = 'unchecked';

  formulario: FormGroup = this.fomBuilder.group({
    id: [0],
    descricao: ['', Validators.required],
    statusFinalizado: [false, Validators.required],
    categoria: ['', Validators.required],
    prioridade: ['', Validators.required],
  });

  constructor(
    private service: TarefaService,
    private fomBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.service.listar();

    this.tarefasSubscription = this.service.tarefas$.subscribe((tarefas) => {
      this.listaTarefas = tarefas;
      this.listaTarefasOriginal = tarefas;
    });
  }

  filtrarTarefasPorDescricao() {
    this.campoBusca = this.campoBusca.trim().toLowerCase();
    if (this.campoBusca && this.campoBusca.length > 2) {
      this.listaTarefas = this.listaTarefasOriginal.filter((tarefa) =>
        tarefa.descricao.toLowerCase().includes(this.campoBusca)
      );
    } else {
      this.listaTarefas = this.listaTarefasOriginal;
    }
  }

  mostrarOuEsconderFormulario() {
    this.formAberto = !this.formAberto;
    this.resetarFormulario();
  }

  salvarTarefa() {
    if (this.formulario.value.id) {
      this.editarTarefa();
    } else {
      this.criarTarefa();
    }
  }

  editarTarefa() {
    if (this.formulario.valid) {
      const tarefaEditada: Tarefa = this.formulario.value;
      this.service.editar(tarefaEditada);
      this.resetarFormulario();
    }
  }

  criarTarefa() {
    if (this.formulario.valid) {
      const novaTarefa: Tarefa = this.formulario.value;
      this.service.criar(novaTarefa);
      this.resetarFormulario();
    }
  }

  excluirTarefa(tarefa: Tarefa) {
    if (tarefa.id) {
      this.service.excluir(tarefa.id);
    }
  }

  cancelar() {
    this.resetarFormulario();
    this.formAberto = false;
  }

  resetarFormulario() {
    this.formulario.reset({
      descricao: '',
      statusFinalizado: false,
      categoria: '',
      prioridade: '',
    });
  }

  carregarParaEditar(id: number) {
    this.service.buscarPorId(id!).subscribe((tarefa) => {
      this.formulario = this.fomBuilder.group({
        id: [tarefa.id],
        descricao: [tarefa.descricao],
        categoria: [tarefa.categoria],
        statusFinalizado: [tarefa.statusFinalizado],
        prioridade: [tarefa.prioridade],
      });
    });
    this.formAberto = true;
  }

  finalizarTarefa(tarefa: Tarefa) {
    this.id = tarefa.id;
    this.service.atualizarStatusTarefa(tarefa);

    this.estadoBotao = tarefa.statusFinalizado ? 'checked' : 'unchecked';
  }

  habilitarBotao(): string {
    if (this.formulario.valid) {
      return 'botao-salvar';
    } else return 'botao-desabilitado';
  }

  campoValidado(campoAtual: string): string {
    if (
      this.formulario.get(campoAtual)?.errors &&
      this.formulario.get(campoAtual)?.touched
    ) {
      this.validado = false;
      return 'form-tarefa input-invalido';
    } else {
      this.validado = true;
      return 'form-tarefa';
    }
  }
}
