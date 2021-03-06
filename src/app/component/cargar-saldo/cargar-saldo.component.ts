import { Component, OnInit } from "@angular/core";
import Swal from "sweetalert2";
import { Cuenta } from "../../model/cuenta";
import { CuentaService } from "../../service/cuenta.service";
import { Transferencia } from "../../model/transferencia";
import { TransferenciaService } from "../../service/transferencia.service";
@Component({
  selector: "app-cargar-saldo",
  templateUrl: "./cargar-saldo.component.html",
  styleUrls: ["./cargar-saldo.component.css"],
})
export class CargarSaldoComponent implements OnInit {
  cuenta: Cuenta = {
    rut: null,
  };

  dinero_depositar: number = null;
  data: any = [];
  resultado: boolean = false;

  transferencia: Transferencia = {
    cuenta_destino: null,
    cuenta_origen: null,
    monto: null,
    saldo: null,

    tipo: "Cargar Saldo",
  };

  constructor(
    private cuenta_service: CuentaService,
    private transferencia_service: TransferenciaService
  ) {}

  ngOnInit(): void {
    this.cuenta.rut = localStorage.getItem("rut");
    //asignando valor al modelo de transferencia
    this.transferencia.cuenta_origen = this.cuenta.rut;
    this.transferencia.cuenta_destino = "No aplica";

    // fin de transferencia
    Swal.showLoading();
    this.get_cuenta(0);
  }

  get_cuenta(operation: number) {
    this.data = [];
    this.cuenta_service.data_cuenta(this.cuenta).subscribe((resp) => {
      let cuentas: any = resp;

      cuentas.map((cliente) => {
        this.data.push(cliente);
      });
      if (operation == 0) Swal.close();
    });
  }

  anadir_dinero() {
    //fecha
    //operacion para ver si puede extraer esa cantidad
    let saldo = parseInt(this.data[0].saldo);
    this.transferencia.monto = this.dinero_depositar;
    //asignado salda actual para lo base de datos.
    this.cuenta.saldo = saldo + this.dinero_depositar;
    this.transferencia.saldo = this.cuenta.saldo;
    if (this.cuenta.saldo > 3000000) {
      Swal.fire({
        html:
          "<hr/>Estimado usuario no es posible realizar esta operación, ya las cuentas no pueden realizar depositos de mas de $3,000,000.<hr/>",
        icon: "error",
        allowOutsideClick: false,
      });
    } else {
      Swal.fire({
        title: "¿Esta seguro de continuar esta operación?",
        html: "<hr/>",
        showCancelButton: true,
        confirmButtonText: "Continuar",
        cancelButtonText: "Cancelar",
        allowOutsideClick: false,
      }).then((result) => {
        //cuando confirma la operación
        if (result.isConfirmed) {
          this.transferencia_service
            .registrar_transferencia(this.transferencia)
            .subscribe((resp) => {
              this.cuenta_service
                .update_cuenta(this.cuenta.rut, this.cuenta)
                .subscribe((resp) => {
                  Swal.fire({
                    html: "<hr/>La transacción ha sido realizada<hr/>",
                    icon: "success",
                    allowOutsideClick: false,
                  });
                  this.resultado = true;
                  //recardo el dato para ver el nuevo saldo del cliente
                  this.get_cuenta(1);
                });
            });
        }
      });
    }
  }
  //fin de la funcion
}
